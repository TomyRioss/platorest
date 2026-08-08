"use client";

import { useState } from "react";
import { HiOutlineMinus, HiOutlinePlus, HiXMark } from "react-icons/hi2";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/utils";

export type CatalogVariant = {
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
};

type EditableItem = {
  variantId: string;
  name: string;
  variantName: string;
  quantity: number;
};

export function EditOrderDialog({
  order,
  catalog,
  isPending,
  onSave,
  onClose,
}: {
  order: { id: string; items: EditableItem[] };
  catalog: CatalogVariant[];
  isPending: boolean;
  onSave: (items: EditableItem[], total: number) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<EditableItem[]>(order.items);
  const [addVariantId, setAddVariantId] = useState("");

  function priceFor(variantId: string) {
    return catalog.find((c) => c.variantId === variantId)?.price ?? 0;
  }

  function changeQuantity(variantId: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.variantId === variantId ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  function addProduct() {
    if (!addVariantId) return;
    const catalogItem = catalog.find((c) => c.variantId === addVariantId);
    if (!catalogItem) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === addVariantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === addVariantId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          variantId: catalogItem.variantId,
          name: catalogItem.productName,
          variantName: catalogItem.variantName,
          quantity: 1,
        },
      ];
    });
    setAddVariantId("");
  }

  const total = items.reduce((sum, i) => sum + priceFor(i.variantId) * i.quantity, 0);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar pedido</DialogTitle>
        </DialogHeader>

        <ul className="space-y-2">
          {items.length === 0 && (
            <li className="text-sm text-text-secondary">Sin productos.</li>
          )}
          {items.map((item) => (
            <li key={item.variantId} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm text-text-primary">
                {item.name}
                {item.variantName !== "Único" ? ` (${item.variantName})` : ""}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => changeQuantity(item.variantId, -1)}
                >
                  <HiOutlineMinus className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => changeQuantity(item.variantId, 1)}
                >
                  <HiOutlinePlus className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Quitar producto"
                  disabled={isPending}
                  onClick={() => removeItem(item.variantId)}
                >
                  <HiXMark className="h-4 w-4 text-red-600" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Select value={addVariantId} onValueChange={(v) => setAddVariantId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Agregar producto..." />
            </SelectTrigger>
            <SelectContent>
              {catalog.map((c) => (
                <SelectItem key={c.variantId} value={c.variantId}>
                  {c.productName}
                  {c.variantName !== "Único" ? ` (${c.variantName})` : ""} · $
                  {formatMoney(c.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" disabled={!addVariantId || isPending} onClick={addProduct}>
            Agregar
          </Button>
        </div>

        <p className="text-right text-sm font-medium text-text-primary">
          Total: ${formatMoney(total)}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isPending || items.length === 0}
            onClick={() => onSave(items, total)}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
