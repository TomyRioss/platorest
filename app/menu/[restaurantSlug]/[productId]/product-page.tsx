"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiXMark } from "react-icons/hi2";
import { addToCart } from "@/lib/cart";

type Modifier = { id: string; name: string; price: number };
type ModifierGroup = { id: string; name: string; required: boolean; multiple: boolean; modifiers: Modifier[] };
export type PageProduct = {
  id: string;
  variantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  modifierGroups: ModifierGroup[];
};

export function ProductPage({
  restaurantSlug,
  product,
}: {
  restaurantSlug: string;
  product: PageProduct;
}) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);

  function goBack() {
    router.push(`/menu/${restaurantSlug}`);
  }

  function toggleOption(group: ModifierGroup, modifierId: string) {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.multiple) {
        const next = current.includes(modifierId)
          ? current.filter((id) => id !== modifierId)
          : [...current, modifierId];
        return { ...prev, [group.id]: next };
      }
      return { ...prev, [group.id]: current.includes(modifierId) ? [] : [modifierId] };
    });
  }

  const selectedModifiers = product.modifierGroups.flatMap((g) =>
    g.modifiers.filter((m) => (selections[g.id] ?? []).includes(m.id)),
  );
  const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const unitPrice = product.price + modifiersTotal;
  const missingRequired = product.modifierGroups.some(
    (g) => g.required && (selections[g.id] ?? []).length === 0,
  );

  function handleAdd() {
    if (missingRequired) return;
    const key = `${product.variantId}|${selectedModifiers.map((m) => m.id).sort().join(",")}`;
    addToCart(restaurantSlug, {
      variantId: product.variantId,
      name: product.name,
      price: unitPrice,
      qty,
      modifiers: selectedModifiers.map((m) => ({ name: m.name, price: m.price })),
      key,
    });
    goBack();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-background pb-28">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-text-primary">{product.name}</h1>
        <button
          type="button"
          onClick={goBack}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={640}
            height={360}
            className="h-48 w-full rounded-lg object-cover"
          />
        )}
        {product.description && <p className="text-sm text-text-secondary">{product.description}</p>}
        <p className="text-lg font-bold text-primary">${product.price.toLocaleString("es-AR")}</p>

        {product.modifierGroups.map((group) => (
          <div key={group.id} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">{group.name}</p>
              {group.required && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                  Obligatorio
                </span>
              )}
            </div>
            <div className="space-y-2">
              {group.modifiers.map((m) => {
                const checked = (selections[group.id] ?? []).includes(m.id);
                return (
                  <label key={m.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-text-primary">
                      <input
                        type={group.multiple ? "checkbox" : "radio"}
                        name={group.id}
                        checked={checked}
                        onChange={() => toggleOption(group, m.id)}
                      />
                      {m.name}
                    </span>
                    {m.price > 0 && <span className="text-text-secondary">+${m.price.toLocaleString("es-AR")}</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium text-text-primary">Unidades</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-primary hover:bg-surface"
            >
              −
            </button>
            <span className="w-4 text-center text-sm font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-primary hover:bg-surface"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-2xl border-t border-border bg-background p-4">
        <button
          type="button"
          onClick={handleAdd}
          disabled={missingRequired}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar a mi pedido · ${(unitPrice * qty).toLocaleString("es-AR")}
        </button>
      </div>
    </main>
  );
}
