"use client";

import { useState, useTransition } from "react";
import { HiStar, HiMapPin } from "react-icons/hi2";
import { saveSurveyConfig } from "./actions";

type InternalState = { points: number; active: boolean };
type ExternalState = { points: number; active: boolean; externalUrl: string };

export function EncuestasClient({
  businessId,
  internal: initialInternal,
  external: initialExternal,
}: {
  businessId: string;
  internal: InternalState;
  external: ExternalState;
}) {
  const [internal, setInternal] = useState(initialInternal);
  const [external, setExternal] = useState(initialExternal);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedType, setSavedType] = useState<"INTERNAL" | "EXTERNAL" | null>(null);

  function save(type: "INTERNAL" | "EXTERNAL", data: { points: number; active: boolean; externalUrl?: string }) {
    setError(null);
    startTransition(async () => {
      const result = await saveSurveyConfig({ businessId, type, ...data });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedType(type);
      setTimeout(() => setSavedType(null), 2000);
    });
  }

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <h1 className="mb-1 text-lg font-semibold text-text-primary">Encuestas</h1>
      <p className="mb-4 text-sm text-text-secondary">
        Sumá puntos a tus clientes cuando completan una encuesta interna o dejan una reseña externa.
      </p>

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div className="rounded-lg bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <HiStar className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">Encuesta interna</h2>
          </div>
          <p className="mb-3 text-xs text-text-secondary">
            Cuestionario fijo de 1 a 5 estrellas: atención, calidad de comida y experiencia general.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Puntos por completar</span>
              <input
                type="number"
                min={0}
                value={internal.points}
                onChange={(e) => setInternal((prev) => ({ ...prev, points: Number(e.target.value) }))}
                className="w-32 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="flex items-center gap-2 pb-1.5">
              <input
                type="checkbox"
                checked={internal.active}
                onChange={(e) => setInternal((prev) => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="text-sm text-text-primary">Activa</span>
            </label>
            <button
              onClick={() => save("INTERNAL", internal)}
              disabled={isPending}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Guardar
            </button>
            {savedType === "INTERNAL" && <span className="pb-1.5 text-xs font-medium text-primary">Guardado ✓</span>}
          </div>
        </div>

        <div className="rounded-lg bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <HiMapPin className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">Encuesta externa (Google Maps)</h2>
          </div>
          <p className="mb-3 text-xs text-text-secondary">
            El cliente deja una reseña en tu perfil de Google Maps y reclama los puntos.
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Link a la reseña de Google Maps</span>
              <input
                type="url"
                placeholder="https://g.page/r/..."
                value={external.externalUrl}
                onChange={(e) => setExternal((prev) => ({ ...prev, externalUrl: e.target.value }))}
                className="w-full max-w-md rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary">Puntos por completar</span>
                <input
                  type="number"
                  min={0}
                  value={external.points}
                  onChange={(e) => setExternal((prev) => ({ ...prev, points: Number(e.target.value) }))}
                  className="w-32 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="flex items-center gap-2 pb-1.5">
                <input
                  type="checkbox"
                  checked={external.active}
                  onChange={(e) => setExternal((prev) => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className="text-sm text-text-primary">Activa</span>
              </label>
              <button
                onClick={() => save("EXTERNAL", external)}
                disabled={isPending}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                Guardar
              </button>
              {savedType === "EXTERNAL" && <span className="pb-1.5 text-xs font-medium text-primary">Guardado ✓</span>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
