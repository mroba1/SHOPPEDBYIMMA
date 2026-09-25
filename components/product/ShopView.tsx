"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ProductGrid } from "./ProductCard";
import { SearchIcon } from "@/components/ui/Icons";

type Sort = "new" | "low" | "high";

export function ShopView({ products, categories, active }: { products: Product[]; categories: Category[]; active?: string }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("new");

  const visible = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = products.filter((p) => !n || p.name.toLowerCase().includes(n) || p.code.toLowerCase().includes(n) || p.description.toLowerCase().includes(n));
    if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, q, sort]);

  const chip = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold tracking-[0.08em] whitespace-nowrap transition",
      isActive ? "bg-charcoal text-cream" : "bg-white/70 text-espresso ring-1 ring-charcoal/10 hover:ring-charcoal/40",
    );

  return (
    <>
      <div className="sticky top-16 z-20 -mx-5 border-b border-charcoal/8 bg-cream/92 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-20 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0" aria-label="Categories">
            <Link href="/shop" className={chip(!active)} scroll={false}>All</Link>
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop/${c.slug}`} className={chip(active === c.slug)} scroll={false}>
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-white/80 px-4 ring-1 ring-charcoal/10 focus-within:ring-2 focus-within:ring-blush-deep lg:w-64">
              <SearchIcon width={17} height={17} className="text-taupe" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search products" className="w-full bg-transparent text-sm outline-none placeholder:text-taupe" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="h-11 rounded-full bg-white/80 px-4 text-sm ring-1 ring-charcoal/10 outline-none">
              <option value="new">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs tracking-[0.14em] text-taupe uppercase">{visible.length} piece{visible.length === 1 ? "" : "s"}</p>
      {visible.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-3xl italic">Nothing found{q && ` for "${q}"`}</p>
          <p className="mt-2 text-taupe">Can&apos;t find it? Send us a SHEIN link on WhatsApp and we&apos;ll get it for you.</p>
        </div>
      ) : (
        <ProductGrid key={active ?? "all"} products={visible} className="mt-5" />
      )}
    </>
  );
}
