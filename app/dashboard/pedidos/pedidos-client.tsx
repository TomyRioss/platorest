"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "./actions";

type Order = {
  id: string;
  source: "POS" | "WEB";
  fulfillment: "PICKUP" | "DELIVERY" | "DINE_IN";
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  total: number;
  createdAt: string;
  customerName: string | null;
  items: { name: string; quantity: number }[];
};

const STATUS_FLOW: Order["status"][] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export function PedidosClient({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(orderId: string, newStatus: Order["status"]) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    });
  }

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-xl font-semibold text-text-primary">
          Pedidos
        </h1>

        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <ul className="divide-y divide-border rounded-lg border border-border bg-background">
          {orders.length === 0 && (
            <li className="p-4 text-sm text-text-secondary">
              Sin pedidos todavía.
            </li>
          )}
          {orders.map((order) => (
            <li key={order.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-text-primary">
                    #{order.id.slice(-8)} · {order.source} · {order.fulfillment}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {order.customerName ?? "Sin cliente"} ·{" "}
                    {new Date(order.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
                <select
                  value={order.status}
                  disabled={isPending}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value as Order["status"])
                  }
                  className="rounded border border-border px-2 py-1 text-sm"
                >
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <ul className="mt-2 text-sm text-text-primary">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}x {item.name}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-right font-medium text-text-primary">
                Total: ${order.total}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
