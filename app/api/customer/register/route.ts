import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, restaurantSlug } = await req.json();

    if (!name || !email || !password || !restaurantSlug) {
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
    if (!restaurant) {
      return NextResponse.json({ error: "Local no encontrado." }, { status: 404 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        customers: {
          create: {
            businessId: restaurant.businessId,
            name,
            email,
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
