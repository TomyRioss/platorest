"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Errors = { name?: string; email?: string; restaurant?: string; phone?: string };

export default function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

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
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
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
          />
          {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
        </div>
      </div>

      <Button type="submit" className="h-auto w-full rounded-lg py-3 text-base shadow-lg">
        Enviar solicitud
      </Button>
      <p className="text-center text-xs text-text-secondary">
        Sin compromiso de compra. Respuesta en menos de 24hs.
      </p>
    </form>
  );
}
