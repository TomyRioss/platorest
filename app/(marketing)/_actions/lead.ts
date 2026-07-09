"use server";

import { prisma } from "@/lib/prisma";

export type CreateLeadInput = {
  name: string;
  email: string;
  restaurantName: string;
  phone: string;
};

export type CreateLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createLead(
  data: CreateLeadInput,
): Promise<CreateLeadResult> {
  const name = data.name?.trim() ?? "";
  const email = data.email?.trim() ?? "";
  const restaurantName = data.restaurantName?.trim() ?? "";
  const phone = data.phone?.trim() ?? "";

  if (!name) return { ok: false, error: "Ingresá tu nombre." };
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Ingresá un email válido." };
  }
  if (!restaurantName) {
    return { ok: false, error: "Ingresá el nombre de tu local." };
  }
  if (!phone) return { ok: false, error: "Ingresá un teléfono de contacto." };

  const lead = await prisma.lead.create({
    data: {
      name,
      email: email.toLowerCase(),
      restaurantName,
      phone,
    },
  });

  return { ok: true, id: lead.id };
}
