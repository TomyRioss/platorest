"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createLead } from "../_actions/lead";

type Mode = "contacto" | "contactar";
type Errors = { name?: string; email?: string; restaurant?: string; phone?: string };

const PHONE_NUMBER = "+54 9 11 7141-0652";
const PHONE_HREF = "tel:+5491171410652";

export default function LeadForm() {
  const [mode, setMode] = useState<Mode>("contacto");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Ingresá tu nombre.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Ingresá un email válido.";
    if (!restaurant.trim()) next.restaurant = "Ingresá el nombre de tu local.";
    if (!phone.trim()) next.phone = "Ingresá un teléfono de contacto.";
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    startTransition(async () => {
      const result = await createLead({
        name,
        email,
        restaurantName: restaurant,
        phone,
      });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setServerError(result.error);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center">
        <p className="font-medium text-text-primary">¡Solicitud enviada!</p>
        <p className="mt-1 text-sm text-text-secondary">
          Te contactamos en menos de 24hs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto flex w-fit rounded-full border border-border bg-orange-50 p-1">
        {(["contacto", "contactar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-semibold capitalize transition-colors duration-200",
              mode === m
                ? "bg-primary text-white shadow"
                : "text-text-secondary hover:text-primary"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "contactar" ? (
        <a
          href={PHONE_HREF}
          className="block py-10 text-center text-3xl font-bold text-primary transition-colors duration-200 hover:text-primary-hover md:text-5xl"
        >
          {PHONE_NUMBER}
        </a>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="lead-name" className="mb-1 block text-sm font-medium text-primary">
              Nombre completo
            </label>
            <Input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              disabled={pending}
            />
            {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="lead-email" className="mb-1 block text-sm font-medium text-primary">
              Email corporativo
            </label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@restaurante.com"
              disabled={pending}
            />
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-restaurant" className="mb-1 block text-sm font-medium text-primary">
                Nombre del local
              </label>
              <Input
                id="lead-restaurant"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                placeholder="Mi Parrilla"
                disabled={pending}
              />
              {errors.restaurant && <p className="mt-1 text-sm text-danger">{errors.restaurant}</p>}
            </div>
            <div>
              <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium text-primary">
                Teléfono
              </label>
              <Input
                id="lead-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 ..."
                disabled={pending}
              />
              {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-danger">{serverError}</p>
          )}

          <Button type="submit" disabled={pending} className="h-auto w-full rounded-lg py-3 text-base shadow-lg">
            {pending ? "Enviando..." : "Enviar solicitud"}
          </Button>
          <p className="text-center text-xs text-text-secondary">
            Sin compromiso de compra. Respuesta en menos de 24hs.
          </p>
        </form>
      )}
    </div>
  );
}
