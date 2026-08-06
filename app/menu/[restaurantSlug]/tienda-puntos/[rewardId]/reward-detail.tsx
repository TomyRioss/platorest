"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiXMark, HiCheckCircle, HiGift } from "react-icons/hi2";
import { redeemReward } from "../actions";

type Modifier = { id: string; name: string; pointsCost: number };
type ModifierGroup = { id: string; name: string; required: boolean; multiple: boolean; modifiers: Modifier[] };
export type RewardDetailData = {
  id: string;
  variantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pointsCost: number;
  modifierGroups: ModifierGroup[];
};

export function RewardDetail({
  restaurantSlug,
  businessId,
  balance,
  reward,
}: {
  restaurantSlug: string;
  businessId: string;
  balance: number;
  reward: RewardDetailData;
}) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  function goBack() {
    router.push(`/menu/${restaurantSlug}/tienda-puntos`);
  }

  function toggleOption(group: ModifierGroup, modifierId: string) {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.multiple) {
        const next = current.includes(modifierId) ? current.filter((id) => id !== modifierId) : [...current, modifierId];
        return { ...prev, [group.id]: next };
      }
      return { ...prev, [group.id]: current.includes(modifierId) ? [] : [modifierId] };
    });
  }

  const selectedModifiers = reward.modifierGroups.flatMap((g) => g.modifiers.filter((m) => (selections[g.id] ?? []).includes(m.id)));
  const modifiersCost = selectedModifiers.reduce((sum, m) => sum + m.pointsCost, 0);
  const totalCost = reward.pointsCost + modifiersCost;
  const missingRequired = reward.modifierGroups.some((g) => g.required && (selections[g.id] ?? []).length === 0);
  const canAfford = balance >= totalCost;

  function handleRedeem() {
    if (missingRequired || !canAfford) return;
    setError(null);
    startTransition(async () => {
      const result = await redeemReward(businessId, reward.variantId, selectedModifiers.map((m) => m.id));
      if (!result.ok) {
        console.error("[RewardDetail] redeem failed", result.error);
        setError(result.error);
        return;
      }
      setRedeemedCode(result.code);
    });
  }

  if (redeemedCode) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <HiCheckCircle className="h-9 w-9 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-text-primary">¡Canjeado!</h1>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-base font-semibold text-text-primary">{reward.name}</p>
          {selectedModifiers.length > 0 && (
            <p className="text-sm text-text-secondary">
              {selectedModifiers.map((m) => m.name).join(", ")}
            </p>
          )}
          <p className="text-sm text-text-secondary">{totalCost.toLocaleString("es-AR")} pts</p>
        </div>
        <p className="text-sm text-text-secondary">Mostrá este código en el local:</p>
        <p className="rounded-xl border border-primary/30 bg-primary-light px-6 py-3 text-2xl font-bold tracking-widest text-primary">
          {redeemedCode}
        </p>
        <button type="button" onClick={goBack} className="mt-4 text-sm font-medium text-primary hover:underline">
          Volver a la tienda de puntos
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col bg-background pb-32">
      <div className="relative">
        {reward.imageUrl ? (
          <div className="relative h-56 w-full sm:h-64">
            <Image src={reward.imageUrl} alt={reward.name} fill sizes="100vw" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-surface">
            <HiGift className="h-12 w-12 text-text-secondary/50" />
          </div>
        )}
        <button
          type="button"
          onClick={goBack}
          aria-label="Cerrar"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-text-primary shadow-sm backdrop-blur-sm active:scale-95"
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-4 py-4">
        <div>
          <h1 className="text-lg font-bold text-text-primary">{reward.name}</h1>
          <p className="mt-0.5 text-base font-semibold text-primary">{reward.pointsCost.toLocaleString("es-AR")} pts</p>
        </div>
        {reward.description && <p className="text-sm text-text-secondary">{reward.description}</p>}

        {reward.modifierGroups.map((group) => (
          <div key={group.id}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">{group.name}</p>
              {group.required && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">Obligatorio</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {group.modifiers.map((m) => {
                const checked = (selections[group.id] ?? []).includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                      checked ? "border-primary bg-primary-light" : "border-border"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-text-primary">
                      <input
                        type={group.multiple ? "checkbox" : "radio"}
                        name={group.id}
                        checked={checked}
                        onChange={() => toggleOption(group, m.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      {m.name}
                    </span>
                    {m.pointsCost > 0 && <span className="shrink-0 text-text-secondary">+{m.pointsCost.toLocaleString("es-AR")} pts</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {error && <p className="text-sm text-danger">{error}</p>}
        {!canAfford && <p className="text-sm text-danger">No tenés puntos suficientes para este premio.</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 w-full border-t border-border bg-background p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          type="button"
          onClick={handleRedeem}
          disabled={missingRequired || !canAfford || isPending}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Canjeando..." : `Canjear · ${totalCost.toLocaleString("es-AR")} pts`}
        </button>
      </div>
    </main>
  );
}
