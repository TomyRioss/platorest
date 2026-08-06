export type CartItem = {
  variantId: string;
  name: string;
  price: number;
  qty: number;
  modifiers?: { name: string; price: number }[];
  key?: string;
};

export type Cart = {
  restaurantSlug: string;
  items: CartItem[];
};

const KEY = "platorest-cart";

export function getCart(): Cart | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Cart;
  } catch {
    return null;
  }
}

export function addToCart(restaurantSlug: string, item: CartItem) {
  const current = getCart();
  const cart: Cart =
    current && current.restaurantSlug === restaurantSlug
      ? current
      : { restaurantSlug, items: [] };

  const key = item.key ?? item.variantId;
  const existing = cart.items.find((i) => (i.key ?? i.variantId) === key);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.items.push(item);
  }

  window.localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCart() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function removeFromCart(key: string) {
  const current = getCart();
  if (!current) return;
  const items = current.items.filter((i) => (i.key ?? i.variantId) !== key);
  if (items.length === 0) {
    clearCart();
    return;
  }
  window.localStorage.setItem(KEY, JSON.stringify({ ...current, items }));
  window.dispatchEvent(new Event("cart-updated"));
}
