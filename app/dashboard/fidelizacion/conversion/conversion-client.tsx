"use client";

import { useState, useTransition } from "react";
import { HiCalculator } from "react-icons/hi2";
import { saveLoyaltyConversion } from "./actions";

export function ConversionClient({
  businessId,
  initialPesosPerPunto,
}: {
  businessId: string;
  initialPesosPerPunto: number;
}) {
  const [pesosPerPunto, setPesosPerPunto] = useState(initialPesosPerPunto);
  const [monto, setMonto] = useState(1000);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveLoyaltyConversion(businessId, pesosPerPunto);
      if (!result.ok) {
        console.error("[ConversionClient] save failed", result.error);
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const puntosGanados = pesosPerPunto > 0 ? Math.floor(monto / pesosPerPunto) : 0;

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <h1 className="mb-1 text-lg font-semibold text-text-primary">Conversión de precio a puntos</h1>
      <p className="mb-4 text-sm text-text-secondary">
        Definí cuántos pesos gastados equivalen a 1 punto. Se aplica a todos los pedidos completados.
      </p>

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div className="rounded-lg bg-background p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Tasa de conversión</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Pesos por cada punto</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">$</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={pesosPerPunto}
                  onChange={(e) => setPesosPerPunto(Number(e.target.value))}
                  className="w-28 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
                <span className="text-sm text-text-secondary">= 1 punto</span>
              </div>
            </label>
            <button
              onClick={save}
              disabled={isPending || pesosPerPunto <= 0}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Guardar
            </button>
            {saved && <span className="pb-1.5 text-xs font-medium text-primary">Guardado ✓</span>}
          </div>
        </div>

        <div className="rounded-lg bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <HiCalculator className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">Calculadora</h2>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Monto del pedido</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">$</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                  className="w-32 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </label>
            <p className="pb-1.5 text-sm text-text-primary">
              → <span className="font-semibold text-primary">{puntosGanados.toLocaleString("es-AR")} puntos</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
