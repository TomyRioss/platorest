"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";

export type CreateCustomerInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export type CreateCustomerResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createCustomerWithAccount(
  input: CreateCustomerInput,
): Promise<CreateCustomerResult> {
  const businessId = await requireBusinessId();
  const { name, email, phone, password } = input;

  if (!name || !email || !password) {
    return { ok: false, error: "Faltan datos requeridos." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (!existing.passwordHash || !(await bcrypt.compare(password, existing.passwordHash))) {
        return { ok: false, error: "Ese email ya tiene una cuenta con otra contraseña." };
      }

      const alreadyCustomer = await prisma.customer.findUnique({
        where: { businessId_userId: { businessId, userId: existing.id } },
      });
      if (alreadyCustomer) {
        return { ok: false, error: "Ese cliente ya existe en este negocio." };
      }

      await prisma.customer.create({
        data: { businessId, userId: existing.id, name: existing.name, email, phone },
      });
      return { ok: true };
    }

    if (phone) {
      const phoneTaken = await prisma.customer.findUnique({
        where: { businessId_phone: { businessId, phone } },
      });
      if (phoneTaken) {
        return { ok: false, error: "Ese teléfono ya está en uso por otro cliente." };
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash,
        customers: { create: { businessId, name, email, phone } },
      },
    });
    return { ok: true };
  } catch (err) {
    console.error("[createCustomerWithAccount]", err);
    return { ok: false, error: "No se pudo crear el cliente." };
  }
}
