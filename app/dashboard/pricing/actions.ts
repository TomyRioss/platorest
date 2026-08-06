"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_PRO_PRICE_ARS } from "@/lib/pricing";

async function fetchWithRetry(url: string, init: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, init);
    if (res.ok || attempt >= retries) return res;
    await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
  }
}

export async function subscribeToPro(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, role: "OWNER" },
    include: { business: true },
    orderBy: { id: "asc" },
  });
  const business = membership?.business;
  if (!business) redirect("/dashboard");

  const payerEmail = (formData.get("mpEmail") as string | null)?.trim() || session.user.email;
  if (!payerEmail) throw new Error("Ingresá el email de tu cuenta de MercadoPago");

  const isDev = process.env.NEXT_PUBLIC_ISDEV === "true";
  const accessToken = isDev
    ? process.env.MERCADOPAGO_ACCESS_TOKEN_TEST
    : process.env.MERCADOPAGO_ACCESS_TOKEN_PROD;
  if (!accessToken) {
    throw new Error("MercadoPago access token no configurado");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://platorest.com";

  const res = await fetchWithRetry("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      reason: "PlatoRest Plan Pro",
      external_reference: business.id,
      payer_email: payerEmail,
      back_url: `${appUrl}/dashboard/pricing`,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: isDev ? 15 : PLAN_PRO_PRICE_ARS,
        currency_id: "ARS",
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("MercadoPago preapproval error:", errBody);
    throw new Error("No se pudo iniciar la suscripción. Intentá de nuevo.");
  }

  const data = await res.json();
  const checkoutUrl = data.init_point ?? data.sandbox_init_point;
  if (!checkoutUrl) throw new Error("MercadoPago no devolvió un link de pago");

  redirect(checkoutUrl);
}
