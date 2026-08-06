import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidSignature(req: Request, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const preapprovalId =
      body?.data?.id ?? url.searchParams.get("id") ?? url.searchParams.get("data.id");
    const type = body?.type ?? url.searchParams.get("type");

    if (type !== "subscription_preapproval" || !preapprovalId) {
      return NextResponse.json({ received: true });
    }

    if (!isValidSignature(req, String(preapprovalId))) {
      console.error("[webhook mercadopago] firma inválida");
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    const isDev = process.env.NEXT_PUBLIC_ISDEV === "true";
    const accessToken = isDev
      ? process.env.MERCADOPAGO_ACCESS_TOKEN_TEST
      : process.env.MERCADOPAGO_ACCESS_TOKEN_PROD;
    if (!accessToken) {
      console.error("[webhook mercadopago] access token no configurado");
      return NextResponse.json({ received: true });
    }

    const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.error("[webhook mercadopago] preapproval fetch failed", await res.text());
      return NextResponse.json({ received: true });
    }

    const preapproval = await res.json();
    const businessId = preapproval.external_reference as string | undefined;
    if (!businessId) return NextResponse.json({ received: true });

    if (preapproval.status === "authorized") {
      // Solo aplica si es la suscripción activa actual o la primera; evita que un
      // webhook atrasado de una suscripción vieja pise una más nueva.
      await prisma.business.updateMany({
        where: {
          id: businessId,
          OR: [{ mpSubscriptionId: null }, { mpSubscriptionId: preapproval.id }],
        },
        data: {
          plan: "pro",
          mpSubscriptionId: preapproval.id,
          proStartedAt: new Date(),
        },
      });
    } else if (["cancelled", "paused"].includes(preapproval.status)) {
      await prisma.business.updateMany({
        where: { id: businessId, mpSubscriptionId: preapproval.id },
        data: { plan: "trial" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook mercadopago] error", err);
    return NextResponse.json({ received: true });
  }
}
