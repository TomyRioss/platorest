import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, restaurantName, phone, notes } = await req.json();

    if (!name || !email || !restaurantName || !phone) {
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: { name, email, restaurantName, phone, notes },
    });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json({ error: "No se pudo guardar el registro." }, { status: 500 });
  }
}
