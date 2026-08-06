"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiGift, HiLockClosed } from "react-icons/hi2";

type Reward = { id: string; name: string; description: string | null; imageUrl: string | null; pointsCost: number };
type Category = { id: string; name: string; rewards: Reward[] };

export function TiendaPuntosContent({
  restaurantSlug,
  balance,
  categories,
}: {
  restaurantSlug: string;
  balance: number;
  categories: Category[];
}) {
  const router = useRouter();

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
        <HiGift className="h-8 w-8 text-text-secondary" />
        <p className="text-sm text-text-secondary">Todavía no hay premios disponibles.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {categories.map((category) => (
        <div key={category.id}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{category.name}</h2>
          <div className="grid grid-cols-2 gap-3">
            {category.rewards.map((reward) => {
              const affordable = balance >= reward.pointsCost;
              return (
                <button
                  key={reward.id}
                  type="button"
                  onClick={() => router.push(`/menu/${restaurantSlug}/tienda-puntos/${reward.id}`)}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-background text-left transition active:scale-[0.98]"
                >
                  <div className="relative aspect-square w-full bg-surface">
                    {reward.imageUrl ? (
                      <Image src={reward.imageUrl} alt={reward.name} fill sizes="50vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <HiGift className="h-10 w-10 text-text-secondary/50" />
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                      {reward.pointsCost.toLocaleString("es-AR")} pts
                    </span>
                    {!affordable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                        <HiLockClosed className="h-6 w-6 text-text-secondary" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-text-primary">{reward.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
