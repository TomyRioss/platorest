"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { HiArrowRight } from "react-icons/hi2";
import AddressAutocomplete from "./AddressAutocomplete";

export default function OnboardingForm({ initialName = "" }: { initialName?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipContact = searchParams.get("skip") === "contact";
  const [step, setStep] = useState<1 | 2>(skipContact ? 2 : 1);
  const hasName = Boolean(initialName);

  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  async function finishOnboarding() {
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, lat: coords?.lat, lng: coords?.lng, fullName, phone, restaurantName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[onboarding] finish failed", data);
        setError(data.error || "No se pudo guardar la dirección. Podés completarla después.");
      }
    } catch (err) {
      console.error("[onboarding] finish failed", err);
      setError("No se pudo guardar la dirección. Podés completarla después.");
    } finally {
      router.push("/dashboard");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <span className="absolute left-6 top-6 text-3xl font-bold text-primary md:left-8 md:top-8">
        PLATOREST
      </span>

      <div className="w-full max-w-lg text-left">
        <h1 className="text-3xl font-bold text-text-primary">
          {step === 1 ? "Ingresa tus datos faltantes" : "Dirección del local"}
        </h1>
        <p className="mt-2 text-text-secondary">
          {step === 1
            ? hasName
              ? "Ingresá estos datos para que tus clientes puedan reconocerte."
              : "No lo encontramos en Google. Ingresá estos datos para que tus clientes puedan reconocerte."
            : "Buscá tu dirección para que tus clientes puedan ubicarte."}
        </p>

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="mt-8 text-left">
            <div className="rounded-2xl bg-background p-8 shadow-sm">
              <div className="space-y-5">
                <div className="relative">
                  <label
                    htmlFor="restaurantName"
                    className="absolute -top-2 left-3 z-10 bg-background px-1 text-xs text-text-secondary"
                  >
                    Nombre del restaurante
                  </label>
                  <input
                    id="restaurantName"
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="La Parrilla de Juan"
                    className="w-full rounded-lg border border-border px-3 py-3 text-text-primary outline-none transition focus:border-primary"
                  />
                </div>

                {!hasName && (
                  <div className="relative">
                    <label
                      htmlFor="fullName"
                      className="absolute -top-2 left-3 z-10 bg-background px-1 text-xs text-text-secondary"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full rounded-lg border border-border px-3 py-3 text-text-primary outline-none transition focus:border-primary"
                    />
                  </div>
                )}

                <div>
                  <div className="relative">
                    <span className="absolute -top-2 left-3 z-10 bg-background px-1 text-xs text-text-secondary">
                      Número de WhatsApp (opcional)
                    </span>
                    <PhoneInput
                      defaultCountry="ar"
                      value={phone}
                      onChange={setPhone}
                      inputClassName="!h-12 !w-full !rounded-r-lg !border-border !text-text-primary"
                      countrySelectorStyleProps={{
                        buttonClassName: "!h-12 !rounded-l-lg !border-border !px-3",
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    Usá el número del dueño o administrador del negocio.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-hover"
              >
                Continuar
                <HiArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="mt-8 text-left">
            <div className="rounded-2xl bg-background p-8 shadow-sm">
              <AddressAutocomplete
                value={address}
                onChange={(addr, c) => {
                  setAddress(addr);
                  setCoords(c);
                }}
              />
            </div>

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={finishOnboarding}
                className="text-sm font-semibold text-text-secondary hover:text-text-primary"
              >
                Omitir este paso
              </button>
              <button
                type="button"
                onClick={finishOnboarding}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Continuar
                <HiArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
