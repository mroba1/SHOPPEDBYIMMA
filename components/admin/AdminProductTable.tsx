"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { Category, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { deleteProductAction, toggleAvailabilityAction } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ui/ProductImage";
import { EditIcon, SearchIcon, TrashIcon } from "@/components/ui/Icons";

export function AdminProductTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  const visible = useMemo(() => {
    const n = q.trim().toLowerCase();
    return products.filter(
      (p) => (cat === "all" || p.categorySlug === cat) && (!n || p.name.toLowerCase().includes(n) || p.code.toLowerCase().includes(n)),
    );
  }, [products, q, cat]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-charcoal/10 focus-within:ring-2 focus-within:ring-blush">
          <SearchIcon width={17} height={17} className="text-taupe" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or product code" className="h-11 w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 rounded-full bg-white px-4 text-sm ring-1 ring-charcoal/10 outline-none" aria-label="Filter by category">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-charcoal/8">
          <p className="font-serif text-2xl italic">No products found</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-charcoal/8 md:divide-y md:divide-charcoal/6">
          <li className="hidden grid-cols-[3.5rem_1fr_9rem_8rem_8rem_6rem] items-center gap-4 bg-linen/60 px-5 py-3 text-[0.68rem] font-semibold tracking-[0.14em] text-taupe uppercase md:grid">
            <span />
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Availability</span>
            <span className="text-right">Actions</span>
          </li>
          {visible.map((p) => (
            <ProductRow key={p.id} product={p} categoryName={catName(p.categorySlug)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductRow({ product: p, categoryName }: { product: Product; categoryName: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <li className={cn("grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-3 border-b border-charcoal/6 p-4 last:border-0 md:grid-cols-[3.5rem_1fr_9rem_8rem_8rem_6rem] md:items-center md:border-0 md:px-5 md:py-3", pending && "opacity-60")}>
      <ProductImage src={p.images[0]} alt={p.name} className="row-span-3 aspect-[4/5] w-full rounded-lg md:row-span-1" />
      <div className="min-w-0">
        <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
        <p className="code-label mt-0.5 text-taupe">{p.code}</p>
      </div>
      <p className="hidden text-sm text-espresso md:block">{categoryName}</p>
      <p className="text-sm font-semibold md:text-base">
        {formatPrice(p.price)}
        <span className="ml-2 text-xs font-normal text-taupe md:hidden">· {categoryName}</span>
      </p>
      <div className="col-start-2 flex items-center justify-between gap-3 md:col-start-auto md:contents">
        <button
          onClick={() => start(() => toggleAvailabilityAction(p.id, !p.available))}
          disabled={pending}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
            p.available ? "bg-blush/45 text-charcoal hover:bg-blush/70" : "bg-charcoal/8 text-taupe hover:bg-charcoal/15",
          )}
          title={p.available ? "Click to mark as sold out" : "Click to mark as available"}
        >
          <span className={cn("size-2 rounded-full", p.available ? "bg-charcoal" : "bg-taupe/50")} />
          {p.available ? "Available" : "Sold out"}
        </button>
        <div className="flex items-center justify-end gap-1">
          {confirming ? (
            <>
              <button onClick={() => start(() => deleteProductAction(p.id))} className="rounded-full bg-rouge px-3 py-1.5 text-xs font-semibold text-cream">Delete</button>
              <button onClick={() => setConfirming(false)} className="rounded-full px-2 py-1.5 text-xs text-taupe">Keep</button>
            </>
          ) : (
            <>
              <Link href={`/admin/products/${p.id}`} className="grid size-9 place-items-center rounded-full text-espresso hover:bg-blush/30" aria-label={`Edit ${p.name}`}>
                <EditIcon width={17} height={17} />
              </Link>
              <button onClick={() => setConfirming(true)} className="grid size-9 place-items-center rounded-full text-taupe hover:bg-rouge/10 hover:text-rouge" aria-label={`Delete ${p.name}`}>
                <TrashIcon width={17} height={17} />
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
