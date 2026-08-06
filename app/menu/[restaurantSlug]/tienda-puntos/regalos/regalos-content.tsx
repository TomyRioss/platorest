"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { HiGift, HiCheckCircle } from "react-icons/hi2";
import { claimVisitGift } from "./actions";

type GiftReward = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  visitMilestone: number;
  claimed: boolean;
};

export function RegalosContent({
  businessId,
  restaurantSlug,
  visits,
  rewards,
}: {
  businessId: string;
  restaurantSlug: string;
  visits: number;
  rewards: GiftReward[];
}) {
  const [claimedIds, setClaimedIds] = useState(() => new Set(rewards.filter((r) => r.claimed).map((r) => r.id)));
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClaim(rewardId: string) {
    setError(null);
    startTransition(async () => {
      const result = await claimVisitGift(businessId, restaurantSlug, rewardId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setClaimedIds((prev) => new Set(prev).add(rewardId));
      setCodes((prev) => ({ ...prev, [rewardId]: result.code }));
    });
  }

  if (rewards.length === 0) {
    return <p className="text-sm text-text-secondary">Todavía no hay regalos por visita disponibles.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">
        Llevás <span className="font-semibold text-primary">{visits}</span> {visits === 1 ? "visita" : "visitas"}.
      </p>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {rewards.map((reward) => {
          const eligible = visits >= reward.visitMilestone;
          const claimed = claimedIds.has(reward.id);
          const progress = Math.min(100, Math.round((visits / reward.visitMilestone) * 100));

          return (
            <div key={reward.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                {reward.imageUrl ? (
                  <Image src={reward.imageUrl} alt={reward.name} width={56} height={56} className="h-14 w-14 object-cover" />
                ) : (
                  <HiGift className="h-6 w-6 text-text-secondary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{reward.name}</p>
                <p className="text-xs text-text-secondary">A las {reward.visitMilestone} visitas</p>
                {!claimed && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              {claimed ? (
                <div className="flex shrink-0 flex-col items-end gap-0.5 text-primary">
                  <span className="flex items-center gap-1 text-xs font-medium">
                    <HiCheckCircle className="h-4 w-4" />
                    Reclamado
                  </span>
                  {codes[reward.id] && <span className="text-xs font-semibold">{codes[reward.id]}</span>}
                </div>
              ) : (
                <button
                  onClick={() => handleClaim(reward.id)}
                  disabled={!eligible || isPending}
                  className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  Reclamar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
