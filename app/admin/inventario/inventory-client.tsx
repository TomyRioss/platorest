"use client";

import { useState, useTransition } from "react";
import { createProduct, updateProduct } from "./actions";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQty: number;
  lowStockAlertAt: number;
  active: boolean;
};

export function InventoryClient({
  restaurantId,
  products,
}: {
  restaurantId: string;
  products: Product[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stockQty: "",
    lowStockAlertAt: "5",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = Number(newProduct.price);
    const stockQty = Number(newProduct.stockQty);
    const lowStockAlertAt = Number(newProduct.lowStockAlertAt);
    if (!newProduct.name || Number.isNaN(price) || Number.isNaN(stockQty)) {
      setError("Completá nombre, precio y stock correctamente.");
      return;
    }
    startTransition(async () => {
      try {
        await createProduct(restaurantId, {
          name: newProduct.name,
          price,
          stockQty,
          lowStockAlertAt,
        });
        setNewProduct({ name: "", price: "", stockQty: "", lowStockAlertAt: "5" });
      } catch (err) {
        console.error("create product error:", err);
        setError("No se pudo crear el producto.");
      }
    });
  }

  function handleStockChange(productId: string, stockQty: number) {
    setError(null);
    startTransition(async () => {
      try {
        await updateProduct(productId, { stockQty });
      } catch (err) {
        console.error("update stock error:", err);
        setError("No se pudo actualizar el stock.");
      }
    });
  }

  function handleAlertChange(productId: string, lowStockAlertAt: number) {
    setError(null);
    startTransition(async () => {
      try {
        await updateProduct(productId, { lowStockAlertAt });
      } catch (err) {
        console.error("update alert error:", err);
        setError("No se pudo actualizar la alerta.");
      }
    });
  }

  function handleToggleActive(productId: string, active: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        await updateProduct(productId, { active });
      } catch (err) {
        console.error("toggle active error:", err);
        setError("No se pudo actualizar el estado.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-xl font-semibold text-text-primary">
          Inventario
        </h1>

        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <form
          onSubmit={handleCreate}
          className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-border bg-background p-4 md:grid-cols-4"
        >
          <input
            placeholder="Nombre"
            value={newProduct.name}
            onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
            className="col-span-2 rounded border border-border px-3 py-2 outline-none focus:border-primary md:col-span-1"
          />
          <input
            type="number"
            placeholder="Precio"
            value={newProduct.price}
            onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
            className="rounded border border-border px-3 py-2 outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stockQty}
            onChange={(e) => setNewProduct((p) => ({ ...p, stockQty: e.target.value }))}
            className="rounded border border-border px-3 py-2 outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="Alerta stock min."
            value={newProduct.lowStockAlertAt}
            onChange={(e) => setNewProduct((p) => ({ ...p, lowStockAlertAt: e.target.value }))}
            className="rounded border border-border px-3 py-2 outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isPending}
            className="col-span-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover disabled:opacity-50 md:col-span-4"
          >
            Agregar producto
          </button>
        </form>

        <ul className="divide-y divide-border rounded-lg border border-border bg-background">
          {products.map((p) => {
            const lowStock = p.stockQty <= p.lowStockAlertAt;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-[120px] flex-1">
                  <p className="font-medium text-text-primary">{p.name}</p>
                  <p className="text-sm text-text-secondary">${p.price}</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-text-secondary">Stock</label>
                  <input
                    type="number"
                    defaultValue={p.stockQty}
                    onBlur={(e) => handleStockChange(p.id, Number(e.target.value))}
                    className="w-20 rounded border border-border px-2 py-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-text-secondary">Alerta</label>
                  <input
                    type="number"
                    defaultValue={p.lowStockAlertAt}
                    onBlur={(e) => handleAlertChange(p.id, Number(e.target.value))}
                    className="w-16 rounded border border-border px-2 py-1"
                  />
                </div>

                {lowStock && (
                  <span className="rounded bg-danger/10 px-2 py-1 text-xs font-medium text-danger">
                    Stock bajo
                  </span>
                )}

                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={(e) => handleToggleActive(p.id, e.target.checked)}
                  />
                  Activo
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
