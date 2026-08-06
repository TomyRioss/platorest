import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, restaurantSlug } = await req.json();

    if (!name || !email || !phone || !password || !restaurantSlug) {
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
    if (!restaurant) {
      return NextResponse.json({ error: "Local no encontrado." }, { status: 404 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (!existing.passwordHash) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese email. Iniciá sesión con Google y creá una contraseña desde el dashboard." },
          { status: 401 },
        );
      }
      if (!(await bcrypt.compare(password, existing.passwordHash))) {
        return NextResponse.json({ error: "Ya existe una cuenta con ese email. Iniciá sesión con tu contraseña." }, { status: 401 });
      }

      const alreadyCustomer = await prisma.customer.findUnique({
        where: { businessId_userId: { businessId: restaurant.businessId, userId: existing.id } },
      });
      if (alreadyCustomer) {
        return NextResponse.json({ error: "Ya sos cliente de este local. Iniciá sesión." }, { status: 409 });
      }

      await prisma.customer.create({
        data: { businessId: restaurant.businessId, userId: existing.id, name: existing.name, email, phone },
      });

      return NextResponse.json({}, { status: 201 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash,
        customers: {
          create: {
            businessId: restaurant.businessId,
            name,
            email,
            phone,
          },
        },
      },
    });

    return NextResponse.json({}, { status: 201 });
  } catch (err) {
    console.error("[POST /api/customer/register]", err);
    return NextResponse.json({ error: "No se pudo crear la cuenta." }, { status: 500 });
  }
}
