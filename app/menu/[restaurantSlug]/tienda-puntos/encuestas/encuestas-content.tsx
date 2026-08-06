"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HiStar, HiMapPin, HiCheckCircle } from "react-icons/hi2";
import { submitInternalSurvey, claimExternalSurveyPoints } from "./actions";

type InternalConfig = { points: number; completed: boolean };
type ExternalConfig = { points: number; externalUrl: string; completed: boolean };

const CATEGORIES: { key: "attentionRating" | "foodRating" | "experienceRating"; label: string }[] = [
  { key: "attentionRating", label: "Atención" },
  { key: "foodRating", label: "Calidad de la comida" },
  { key: "experienceRating", label: "Experiencia general" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-2xl leading-none">
          <HiStar className={n <= value ? "h-6 w-6 text-primary" : "h-6 w-6 text-border"} />
        </button>
      ))}
    </div>
  );
}

export function EncuestasContent({
  businessId,
  restaurantSlug,
  internal,
  external,
}: {
  businessId: string;
  restaurantSlug: string;
  internal: InternalConfig | null;
  external: ExternalConfig | null;
}) {
  const router = useRouter();
  const [ratings, setRatings] = useState({ attentionRating: 0, foodRating: 0, experienceRating: 0 });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allRated = ratings.attentionRating > 0 && ratings.foodRating > 0 && ratings.experienceRating > 0;

  function handleSubmitInternal() {
    setError(null);
    startTransition(async () => {
      const result = await submitInternalSurvey(businessId, restaurantSlug, ratings);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleClaimExternal() {
    setError(null);
    startTransition(async () => {
      const result = await claimExternalSurveyPoints(businessId, restaurantSlug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (!internal && !external) {
    return <p className="text-sm text-text-secondary">Todavía no hay encuestas disponibles.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {internal && (
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2">
            <HiStar className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">Encuesta interna</h2>
          </div>
          {internal.completed ? (
            <div className="flex items-center gap-2 text-sm text-primary">
              <HiCheckCircle className="h-5 w-5" />
              ¡Gracias por tu opinión! Ya sumaste {internal.points} puntos.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-secondary">Calificá tu experiencia y sumá {internal.points} puntos.</p>
              {CATEGORIES.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-primary">{label}</span>
                  <StarRating value={ratings[key]} onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))} />
                </div>
              ))}
              <button
                onClick={handleSubmitInternal}
                disabled={isPending || !allRated}
                className="mt-1 self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Enviar encuesta
              </button>
            </div>
          )}
        </div>
      )}

      {external && (
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2">
            <HiMapPin className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">Reseña en Google Maps</h2>
          </div>
          {external.completed ? (
            <div className="flex items-center gap-2 text-sm text-primary">
              <HiCheckCircle className="h-5 w-5" />
              ¡Gracias por tu reseña! Ya sumaste {external.points} puntos.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-secondary">
                Dejanos una reseña en Google Maps y sumá {external.points} puntos.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={external.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light"
                >
                  Dejar reseña
                </a>
                <button
                  onClick={handleClaimExternal}
                  disabled={isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Ya la dejé, reclamar puntos
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
