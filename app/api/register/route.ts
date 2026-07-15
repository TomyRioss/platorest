import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

export async function POST(req: Request) {
  try {
    const { name, email, password, restaurantName, phone } = await req.json();

    if (!name || !email || !password || !restaurantName) {
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const baseSlug = slugify(restaurantName) || "negocio";
    let businessSlug = baseSlug;
    let businessSuffix = 1;
    while (await prisma.business.findUnique({ where: { slug: businessSlug } })) {
      businessSlug = `${baseSlug}-${businessSuffix++}`;
    }

    const business = await prisma.business.create({
      data: {
        name: restaurantName,
        slug: businessSlug,
        memberships: {
          create: {
            role: "OWNER",
            user: {
              create: {
                email,
                name,
                phone: phone || undefined,
                passwordHash,
              },
            },
          },
        },
      },
    });

    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        businessId: business.id,
        name: restaurantName,
        slug,
        deliveryRadiusKm: 5,
      },
    });

    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((name, sortOrder) => ({
        restaurantId: restaurant.id,
        name,
        sortOrder,
      })),
    });

    return NextResponse.json({ businessId: business.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/register]", err);
    return NextResponse.json({ error: "No se pudo crear la cuenta." }, { status: 500 });
  }
}
