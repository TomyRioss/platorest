"use client";

import { useState, useTransition } from "react";
import { HiOutlineFire, HiOutlineTruck, HiOutlineCheckCircle, HiXMark } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";
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

const QUICK_ACTIONS: {
  label: string;
  status: Order["status"];
  icon: typeof HiOutlineFire;
  idleClass: string;
  activeClass: string;
}[] = [
  {
    label: "Preparar",
    status: "PREPARING",
    icon: HiOutlineFire,
    idleClass: "border-amber-200 bg-amber-50/60 text-amber-700",
    activeClass: "border-amber-500 bg-amber-100 text-amber-800",
  },
  {
    label: "Enviado",
    status: "READY",
    icon: HiOutlineTruck,
    idleClass: "border-blue-200 bg-blue-50/60 text-blue-700",
    activeClass: "border-blue-500 bg-blue-100 text-blue-800",
  },
  {
    label: "Completado",
    status: "COMPLETED",
    icon: HiOutlineCheckCircle,
    idleClass: "border-green-200 bg-green-50/60 text-green-700",
    activeClass: "border-green-500 bg-green-100 text-green-800",
  },
];

const STATUS_BADGE: Record<Order["status"], { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "border-border bg-muted text-text-secondary" },
  CONFIRMED: { label: "Confirmado", className: "border-purple-200 bg-purple-50 text-purple-700" },
  PREPARING: { label: "Preparando", className: "border-amber-200 bg-amber-50 text-amber-700" },
  READY: { label: "Enviado", className: "border-blue-200 bg-blue-50 text-blue-700" },
  COMPLETED: { label: "Completado", className: "border-green-200 bg-green-50 text-green-700" },
  CANCELLED: { label: "Cancelado", className: "border-red-200 bg-red-50 text-red-700" },
};

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
    <main className="min-h-screen bg-surface">
      <div className="w-full">
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
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">
                      #{order.id.slice(-8)} · {order.source} · {order.fulfillment}
                    </p>
                    <Badge variant="outline" className={STATUS_BADGE[order.status].className}>
                      {STATUS_BADGE[order.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {order.customerName ?? "Sin cliente"} ·{" "}
                    {new Date(order.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.status}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatusChange(order.id, a.status)}
                      className={`flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed ${
                        order.status === a.status ? a.activeClass : a.idleClass
                      }`}
                    >
                      <a.icon className="h-4 w-4" aria-hidden="true" />
                      {a.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    title="Cancelar pedido"
                    disabled={isPending}
                    onClick={() => handleStatusChange(order.id, "CANCELLED")}
                    className={`flex cursor-pointer items-center rounded border p-1 transition-colors hover:brightness-95 disabled:cursor-not-allowed ${
                      order.status === "CANCELLED"
                        ? "border-red-500 bg-red-100 text-red-800"
                        : "border-red-200 bg-red-50/60 text-red-700"
                    }`}
                  >
                    <HiXMark className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <ul className="mt-2 text-sm text-text-primary">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}x {item.name}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-right font-medium text-text-primary">
                Total: ${formatMoney(order.total)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
