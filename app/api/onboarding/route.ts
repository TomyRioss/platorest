import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { address, lat, lng } = await req.json();

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, role: "OWNER" },
      include: { business: true },
    });
    if (!membership) {
      return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
    }

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { businessId: membership.businessId },
    });
    if (existingRestaurant) {
      return NextResponse.json({ slug: existingRestaurant.slug }, { status: 200 });
    }

    const baseSlug = slugify(membership.business.name) || "negocio";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        businessId: membership.businessId,
        name: membership.business.name,
        slug,
        address: address ?? undefined,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
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

    return NextResponse.json({ slug: restaurant.slug }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/onboarding]", err);
    return NextResponse.json({ error: "No se pudo completar el registro del local." }, { status: 500 });
  }
}
