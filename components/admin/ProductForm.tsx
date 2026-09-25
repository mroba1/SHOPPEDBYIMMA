"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Category, Product } from "@/lib/types";
import { nextProductCode, saveProductAction } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import { ArrowLeft, CloseIcon } from "@/components/ui/Icons";
import { ImageUploader } from "./ImageUploader";

export function ProductForm({ product, categories, suggestedCode }: { product?: Product; categories: Category[]; suggestedCode?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [codeTouched, setCodeTouched] = useState(!!product);

  const [f, setF] = useState({
    name: product?.name ?? "",
    code: product?.code ?? suggestedCode ?? "",
    price: product?.price ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : "",
    categorySlug: product?.categorySlug ?? categories[0]?.slug ?? "",
    description: product?.description ?? "",
    images: product?.images ?? [],
    sizes: product?.sizes ?? [],
    colors: product?.colors ?? [],
    available: product?.available ?? true,
    featured: product?.featured ?? false,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    setSaved(false);
  };

  const onCategory = async (slug: string) => {
    set("categorySlug", slug);
    if (!codeTouched) set("code", await nextProductCode(slug));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveProductAction({
        id: product?.id,
        name: f.name,
        code: f.code,
        price: Number(f.price.replace(/[^\d.]/g, "")),
        compareAtPrice: f.compareAtPrice ? Number(f.compareAtPrice.replace(/[^\d.]/g, "")) : undefined,
        categorySlug: f.categorySlug,
        description: f.description,
        images: f.images,
        sizes: f.sizes,
        colors: f.colors,
        available: f.available,
        featured: f.featured,
      });
      if (!res.ok) return setError(res.error);
      if (product) {
        setSaved(true);
        router.refresh();
      } else {
        router.push("/admin/products?created=1");
      }
    });
  };

  return (
    <form onSubmit={submit} className="pb-28">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-taupe uppercase hover:text-charcoal">
        <ArrowLeft width={16} height={16} /> Products
      </Link>
      <h1 className="mt-3 text-[1.75rem] leading-tight font-semibold tracking-tight sm:text-3xl">{product ? "Edit product" : "Add a product"}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card title="Photos" hint="The first photo is what you'll see on orders — make it clear.">
            <ImageUploader value={f.images} onChange={(v) => set("images", v)} />
          </Card>

          <Card title="Details">
            <div className="space-y-5">
              <Field label="Product name">
                <input required value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Red Ruffle Maxi Dress" className={input} />
              </Field>
              <Field label="Description">
                <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Fabric, fit, what makes it special…" className={cn(input, "resize-y")} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Price (₦)">
                  <input required inputMode="numeric" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="18500" className={input} />
                </Field>
                <Field label="Was price (₦)" hint="Optional — shows a sale badge">
                  <input inputMode="numeric" value={f.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} placeholder="22000" className={input} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Variants" hint="Customers must pick one of each before adding to cart. Leave empty if not needed.">
            <div className="space-y-5">
              <TagInput label="Sizes" value={f.sizes} onChange={(v) => set("sizes", v)} placeholder="S, M, L or 4–5 years…" presets={[["XS", "S", "M", "L", "XL"], ["37", "38", "39", "40", "41"], ["1–2 years", "2–3 years", "4–5 years"]]} />
              <TagInput label="Colours / variants" value={f.colors} onChange={(v) => set("colors", v)} placeholder="Red, Black…" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Organise">
            <div className="space-y-5">
              <Field label="Category">
                <select value={f.categorySlug} onChange={(e) => onCategory(e.target.value)} className={input}>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Product code" hint="Unique. Shown to you on every order.">
                <input
                  required
                  value={f.code}
                  onChange={(e) => {
                    setCodeTouched(true);
                    set("code", e.target.value.toUpperCase());
                  }}
                  className={cn(input, "font-mono tracking-wider")}
                />
              </Field>
            </div>
          </Card>

          <Card title="Visibility">
            <Toggle label="Available to order" hint="Turn off to show as sold out" checked={f.available} onChange={(v) => set("available", v)} />
            <div className="my-4 border-t border-charcoal/8" />
            <Toggle label="Feature on home page" hint="Shows in 'New in'" checked={f.featured} onChange={(v) => set("featured", v)} />
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-charcoal/10 bg-cream/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className={cn("text-sm", error ? "text-rouge" : "text-taupe")} role={error ? "alert" : undefined}>
            {error ?? (saved ? "✓ Saved" : product ? "Changes save when you tap Save." : "New products appear in the shop straight away.")}
          </p>
          <button disabled={pending} className="btn btn-dark shrink-0 !min-h-12 disabled:opacity-60">
            {pending ? "Saving…" : product ? "Save changes" : "Add product"}
          </button>
        </div>
      </div>
    </form>
  );
}

const input = "w-full rounded-xl border border-charcoal/15 bg-cream/60 px-4 py-3 text-[0.95rem] outline-none transition focus:bg-white focus:ring-4 focus:ring-blush/40";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-taupe">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-[0.12em] uppercase">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-taupe">{hint}</span>}
    </label>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-taupe">{hint}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-charcoal" : "bg-nude")}>
        <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-cream shadow transition-transform", checked && "translate-x-5 bg-blush")} />
      </button>
    </div>
  );
}

function TagInput({ label, value, onChange, placeholder, presets }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder: string; presets?: string[][] }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft("");
  };
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold tracking-[0.12em] uppercase">{label}</span>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-charcoal/15 bg-cream/60 p-2 focus-within:bg-white focus-within:ring-4 focus-within:ring-blush/40">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-charcoal py-1 pr-1.5 pl-3 text-sm text-cream">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="grid size-5 place-items-center rounded-full hover:bg-white/15" aria-label={`Remove ${v}`}>
              <CloseIcon width={12} height={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={commit}
          placeholder={value.length ? "Add more…" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none"
        />
      </div>
      {presets && (
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.join()} type="button" onClick={() => onChange([...new Set([...value, ...p])])} className="rounded-full bg-linen px-3 py-1 text-xs text-espresso hover:bg-blush/40">
              + {p[0]}–{p[p.length - 1]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
