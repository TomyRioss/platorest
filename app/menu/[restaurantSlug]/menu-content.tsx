"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { HiBars3, HiChevronDown, HiMagnifyingGlass } from "react-icons/hi2";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductModifiersDrawer } from "./product-modifiers-drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Variant = { id: string; price: number | string };
type ModifierGroup = {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  modifiers: { id: string; name: string; price: number }[];
};
type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
};
type Category = { id: string; name: string; isFeatured: boolean; products: Product[] };

export function MenuContent({
  restaurantSlug,
  categories,
}: {
  restaurantSlug: string;
  categories: Category[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [modifierProduct, setModifierProduct] = useState<Product | null>(null);

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

  function goToCategory(categoryId: string) {
    setMenuOpen(false);
    document.getElementById(`cat-${categoryId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {categories.length > 0 && (
        <nav className="sticky top-[45px] z-10 flex flex-col gap-2 border-b border-border bg-background px-4 py-2">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-1.5 rounded-lg bg-black/[0.06] px-3 py-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
            <HiMagnifyingGlass className="h-4 w-4 shrink-0 text-text-secondary" />
          </div>
          <div className="mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-text-primary hover:bg-surface"
            >
              <HiBars3 className="h-4 w-4" />
              Menú
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

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-center text-base">Menú</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => goToCategory(category.id)}
                className="flex flex-col items-start gap-0.5 border-b border-border py-3 text-left last:border-b-0"
              >
                <span className="font-semibold text-text-primary">{category.name}</span>
                <span className="text-sm text-primary">{category.products.length} productos</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="mx-auto max-w-2xl px-4 lg:max-w-4xl">
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
              <summary className="mb-3 flex cursor-pointer list-none items-center justify-between border-b border-border pb-2 text-lg font-bold uppercase tracking-tight text-text-primary">
                {category.name}
                <HiChevronDown className="h-5 w-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180" />
              </summary>
              {category.isFeatured ? (
                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
                  {category.products.map((product) => {
                    const variant = product.variants[0];
                    return (
                      <div
                        key={product.id}
                        id={`prod-${product.id}`}
                        className="w-40 shrink-0 scroll-mt-16 overflow-hidden rounded-lg border border-border bg-background shadow-sm lg:w-52"
                      >
                        <div className="relative">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={200}
                              height={140}
                              className="h-28 w-full object-cover lg:h-36"
                            />
                          ) : (
                            <div className="h-28 w-full bg-primary-light lg:h-36" />
                          )}
                          {variant && (
                            product.modifierGroups.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setModifierProduct(product)}
                                aria-label={`Elegir opciones de ${product.name}`}
                                className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-lg font-bold leading-none text-white shadow-sm hover:bg-primary-hover"
                              >
                                +
                              </button>
                            ) : (
                              <AddToCartButton
                                restaurantSlug={restaurantSlug}
                                productId={variant.id}
                                name={product.name}
                                price={Number(variant.price)}
                              />
                            )
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="truncate font-semibold text-text-primary">{product.name}</p>
                          {product.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                              {product.description}
                            </p>
                          )}
                          {variant && (
                            <p className="mt-1 font-bold text-primary">
                              ${Number(variant.price).toLocaleString("es-AR")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {category.products.map((product) => {
                    const variant = product.variants[0];
                    return (
                      <div
                        key={product.id}
                        id={`prod-${product.id}`}
                        className="flex scroll-mt-16 items-center gap-3 rounded-lg bg-background p-3 shadow-sm lg:gap-5 lg:p-5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text-primary lg:text-lg">{product.name}</p>
                          {product.description && (
                            <p className="mt-0.5 line-clamp-2 text-sm text-text-secondary lg:text-base">
                              {product.description}
                            </p>
                          )}
                          {variant && (
                            <p className="mt-1 font-bold text-primary lg:text-lg">
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
                              className="h-20 w-20 rounded-lg object-cover lg:h-32 lg:w-32"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-lg bg-primary-light lg:h-32 lg:w-32" />
                          )}
                          {variant && (
                            product.modifierGroups.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setModifierProduct(product)}
                                aria-label={`Elegir opciones de ${product.name}`}
                                className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-lg font-bold leading-none text-white shadow-sm hover:bg-primary-hover"
                              >
                                +
                              </button>
                            ) : (
                              <AddToCartButton
                                restaurantSlug={restaurantSlug}
                                productId={variant.id}
                                name={product.name}
                                price={Number(variant.price)}
                              />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </details>
          ))
        )}
      </div>

      <ProductModifiersDrawer
        restaurantSlug={restaurantSlug}
        product={
          modifierProduct
            ? {
                id: modifierProduct.id,
                name: modifierProduct.name,
                description: modifierProduct.description,
                imageUrl: modifierProduct.imageUrl,
                price: Number(modifierProduct.variants[0]?.price ?? 0),
                modifierGroups: modifierProduct.modifierGroups,
              }
            : null
        }
        onClose={() => setModifierProduct(null)}
      />
    </>
  );
}
