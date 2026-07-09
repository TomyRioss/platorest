"use client";

import { useEffect, useState } from "react";
import { getCart, clearCart, type Cart } from "@/lib/cart";
import { createOrder } from "./actions";

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "DELIVERY">(
    "PICKUP",
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MERCADOPAGO">(
    "CASH",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    orderId: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total =
    cart?.items.reduce((sum, i) => sum + i.price * i.qty, 0) ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createOrder({
        restaurantSlug: cart.restaurantSlug,
        items: cart.items.map((i) => ({ productId: i.productId, qty: i.qty })),
        fulfillment,
        deliveryAddress: fulfillment === "DELIVERY" ? deliveryAddress : undefined,
        customerName,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        paymentMethod,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearCart();
      setSuccess({ orderId: result.orderId, total: result.total });
    } catch (err) {
      console.error("checkout error:", err);
      setError("Error al procesar el pedido. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-success">
            ¡Pedido confirmado!
          </h1>
          <p className="text-text-secondary">
            Comprobante #{success.orderId.slice(-8)}
          </p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            Total: ${success.total}
          </p>
          {paymentMethod === "MERCADOPAGO" && (
            <p className="mt-4 text-sm text-text-secondary">
              Pago con Mercado Pago simulado (sin credenciales configuradas).
            </p>
          )}
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <p className="text-text-secondary">Tu carrito está vacío.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-lg rounded-lg border border-border bg-background p-6"
      >
        <h1 className="mb-4 text-xl font-semibold text-text-primary">
          Tu pedido
        </h1>

        <ul className="mb-4 divide-y divide-border">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex justify-between py-2">
              <span className="text-text-primary">
                {item.qty}x {item.name}
              </span>
              <span className="text-text-secondary">
                ${item.price * item.qty}
              </span>
            </li>
          ))}
        </ul>
        <p className="mb-6 text-right font-semibold text-text-primary">
          Total: ${total}
        </p>

        <label className="mb-1 block text-sm text-text-secondary">
          Nombre
        </label>
        <input
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mb-4 w-full rounded border border-border px-3 py-2 outline-none focus:border-primary"
        />

        <div className="mb-4 grid grid-cols-2 gap-3">
          <input
            type="tel"
            placeholder="Teléfono"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="rounded border border-border px-3 py-2 outline-none focus:border-primary"
          />
          <input
            type="email"
            placeholder="Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="rounded border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <label className="mb-1 block text-sm text-text-secondary">
          Entrega
        </label>
        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2 text-text-primary">
            <input
              type="radio"
              checked={fulfillment === "PICKUP"}
              onChange={() => setFulfillment("PICKUP")}
            />
            Retiro en local
          </label>
          <label className="flex items-center gap-2 text-text-primary">
            <input
              type="radio"
              checked={fulfillment === "DELIVERY"}
              onChange={() => setFulfillment("DELIVERY")}
            />
            Delivery
          </label>
        </div>

        {fulfillment === "DELIVERY" && (
          <input
            required
            placeholder="Dirección de entrega"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="mb-4 w-full rounded border border-border px-3 py-2 outline-none focus:border-primary"
          />
        )}

        <label className="mb-1 block text-sm text-text-secondary">Pago</label>
        <div className="mb-6 flex gap-4">
          <label className="flex items-center gap-2 text-text-primary">
            <input
              type="radio"
              checked={paymentMethod === "CASH"}
              onChange={() => setPaymentMethod("CASH")}
            />
            Efectivo
          </label>
          <label className="flex items-center gap-2 text-text-primary">
            <input
              type="radio"
              checked={paymentMethod === "MERCADOPAGO"}
              onChange={() => setPaymentMethod("MERCADOPAGO")}
            />
            Mercado Pago
          </label>
        </div>

        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Confirmar pedido"}
        </button>
      </form>
    </main>
  );
}
