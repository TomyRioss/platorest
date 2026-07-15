"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { HiMagnifyingGlass, HiBars3, HiChevronDown, HiXMark } from "react-icons/hi2";
import { AddToCartButton } from "./add-to-cart-button";

type Variant = { id: string; price: number | string };
type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  variants: Variant[];
};
type Category = { id: string; name: string; products: Product[] };

export function MenuContent({
  restaurantSlug,
  categories,
}: {
  restaurantSlug: string;
  categories: Category[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((category) => ({
        ...category,
        products: category.products.filter((p) => p.name.toLowerCase().includes(q)),
      }))
      .filter((category) => category.products.length > 0);
  }, [categories, query]);

  return (
    <>
      {categories.length > 0 && (
        <nav className="sticky top-[45px] z-10 flex items-center gap-2 overflow-x-auto border-b border-border bg-background px-4 py-2 [scrollbar-width:none]">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            {searchOpen ? (
              <div className="flex h-8 w-40 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2 md:w-72">
                <HiMagnifyingGlass className="h-4 w-4 shrink-0 text-text-secondary" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full min-w-0 bg-transparent text-sm text-text-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                  }}
                  aria-label="Cerrar búsqueda"
                  className="shrink-0 text-text-secondary hover:text-text-primary"
                >
                  <HiXMark className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface"
              >
                <HiMagnifyingGlass className="h-4 w-4" />
              </button>
            )}
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface">
              <HiBars3 className="h-4 w-4" />
            </button>
            <div className="h-5 w-px shrink-0 bg-border" />
            {filteredCategories.map((category) => (
              <a
                key={category.id}
                href={`#cat-${category.id}`}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-primary-light"
              >
                {category.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-2xl px-4">
        {filteredCategories.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 rounded-2xl bg-background p-10 text-center shadow-sm">
            <p className="font-semibold text-text-primary">
              {query ? "No encontramos productos" : "Menú en preparación"}
            </p>
            <p className="text-sm text-text-secondary">
              {query ? "Probá con otra búsqueda." : "Este local todavía no cargó su carta."}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <details
              key={category.id}
              id={`cat-${category.id}`}
              open
              className="group scroll-mt-16 pt-6 first:pt-4"
            >
              <summary className="mb-3 flex cursor-pointer list-none items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-lg font-bold text-text-primary shadow-sm hover:bg-surface">
                {category.name}
                <HiChevronDown className="h-5 w-5 text-text-secondary transition-transform group-open:rotate-180" />
              </summary>
              <div className="flex flex-col gap-3">
                {category.products.map((product) => {
                  const variant = product.variants[0];
                  return (
                    <div
                      key={product.id}
                      id={`prod-${product.id}`}
                      className="flex scroll-mt-16 items-center gap-3 rounded-2xl bg-background p-3 shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-text-primary">{product.name}</p>
                        {product.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-text-secondary">
                            {product.description}
                          </p>
                        )}
                        {variant && (
                          <p className="mt-1 font-bold text-primary">
                            ${Number(variant.price).toLocaleString("es-AR")}
                          </p>
                        )}
                      </div>
                      <div className="relative shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-xl bg-primary-light" />
                        )}
                        {variant && (
                          <AddToCartButton
                            restaurantSlug={restaurantSlug}
                            productId={variant.id}
                            name={product.name}
                            price={Number(variant.price)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          ))
        )}
      </div>
    </>
  );
}
