import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/seo";
import { PromoCountdown } from "@/components/promo-countdown";

const INCLUDED = [
  "Smart POS ilimitado",
  "Inventario en tiempo real",
  "Menú QR digital",
  "Soporte 24/7 feriados y fines de semana",
  "Soporte Presencial CABA y GBA",
  "Todas las funcionalidades actuales y futuras",
];

export default function PreciosPage() {
  if (process.env.NEXT_PUBLIC_SHOW_PRICING !== "true") {
    notFound();
  }

  return (
    <main className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold text-text-primary sm:text-5xl">
            Un solo plan, todo incluido
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Sin sorpresas ni costos ocultos. Acceso total a todas las
            herramientas que tu restaurante necesita para crecer.
          </p>
        </div>

        <Card className="relative overflow-hidden rounded-3xl border-2 border-primary p-16 shadow-xl md:p-20">
          <CardContent className="grid grid-cols-1 items-center gap-12 p-0 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold text-primary sm:text-5xl">
                Plan fundadores
              </h2>
              <ul className="mt-8 space-y-4 text-lg">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-text-primary">
                    <span className="mt-1 text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-base text-text-secondary">
                Tiempo limitado, solo para nuestros primeros 100 clientes.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-10 text-center lg:text-right">
              <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
                Suscripción mensual
              </p>
              <p className="mt-3 text-6xl font-bold text-primary">
                $15<span className="text-2xl font-medium text-text-secondary">/mes</span>
              </p>
              <p className="mt-3 text-base font-semibold text-primary">
                Un plan, todo incluido.
              </p>
              <PromoCountdown className="mt-6" />
              <Link
                href={`mailto:${SITE.email}`}
                className={cn(buttonVariants({ size: "lg" }), "mt-8 h-auto w-full rounded-lg px-6 py-4 text-lg")}
              >
                Contactanos
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
