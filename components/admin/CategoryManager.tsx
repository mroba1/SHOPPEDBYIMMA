"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Category } from "@/lib/types";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import { ArrowUpRight, EditIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";
import { ImageUploader } from "./ImageUploader";

type Draft = { id?: string; name: string; tagline: string; image: string; codePrefix: string };
const empty: Draft = { name: "", tagline: "", image: "", codePrefix: "" };

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!editing) return;
    setError(null);
    start(async () => {
      const res = await saveCategoryAction(editing);
      if (res.ok) setEditing(null);
      else setError(res.error);
    });
  };

  const remove = (id: string) =>
    start(async () => {
      const res = await deleteCategoryAction(id);
      if (!res.ok) setError(res.error);
    });

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={() => { setEditing({ ...empty }); setError(null); }} className="btn btn-dark !min-h-11 !text-[0.7rem]">
          <PlusIcon width={16} height={16} /> New category
        </button>
      </div>

      {error && !editing && <p className="mt-4 rounded-xl bg-rouge/10 px-4 py-3 text-sm text-rouge">{error}</p>}

      {editing && (
        <div className="animate-rise mt-5 rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
          <h2 className="font-semibold">{editing.id ? "Edit category" : "New category"}</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-[14rem_1fr]">
            <ImageUploader multiple={false} value={editing.image ? [editing.image] : []} onChange={(v) => setEditing({ ...editing, image: v[0] ?? "" })} />
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold tracking-[0.12em] uppercase">Name</span>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={field} placeholder="e.g. Bags" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold tracking-[0.12em] uppercase">Tagline</span>
                <input value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} className={field} placeholder="A short line shown on the category card" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold tracking-[0.12em] uppercase">Product code prefix</span>
                <input value={editing.codePrefix} maxLength={3} onChange={(e) => setEditing({ ...editing, codePrefix: e.target.value.toUpperCase() })} className={cn(field, "w-28 font-mono tracking-widest")} placeholder="BG" />
                <span className="mt-1 block text-xs text-taupe">Products in this category get codes like SBM-{editing.codePrefix || "BG"}-001</span>
              </label>
              {error && <p className="text-sm text-rouge">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={pending} className="btn btn-dark !min-h-11 !text-[0.7rem] disabled:opacity-60">{pending ? "Saving…" : "Save category"}</button>
                <button onClick={() => setEditing(null)} className="rounded-full px-5 text-sm text-taupe hover:text-charcoal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ul className={cn("mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3", pending && "opacity-70")}>
        {categories.map((c) => (
          <li key={c.id} className="overflow-hidden rounded-3xl bg-white ring-1 ring-charcoal/8">
            <div className="relative h-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" className="size-full object-cover" />
              <span className="absolute top-3 left-3 rounded-full bg-charcoal/85 px-2.5 py-1 font-mono text-xs tracking-wider text-cream">SBM-{c.codePrefix}</span>
            </div>
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold">{c.name}</p>
                <p className="truncate text-sm text-taupe">{c.tagline}</p>
                <p className="mt-2 text-xs font-semibold tracking-[0.1em] text-espresso uppercase">{counts[c.slug] ?? 0} products</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Link href={`/shop/${c.slug}`} target="_blank" className="grid size-9 place-items-center rounded-full text-taupe hover:bg-blush/30 hover:text-charcoal" aria-label="View in store">
                  <ArrowUpRight width={17} height={17} />
                </Link>
                <button onClick={() => { setEditing({ id: c.id, name: c.name, tagline: c.tagline, image: c.image, codePrefix: c.codePrefix }); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="grid size-9 place-items-center rounded-full text-espresso hover:bg-blush/30" aria-label={`Edit ${c.name}`}>
                  <EditIcon width={17} height={17} />
                </button>
                <button onClick={() => remove(c.id)} className="grid size-9 place-items-center rounded-full text-taupe hover:bg-rouge/10 hover:text-rouge" aria-label={`Delete ${c.name}`} title={counts[c.slug] ? "Move its products first" : "Delete"}>
                  <TrashIcon width={17} height={17} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const field = "w-full rounded-xl border border-charcoal/15 bg-cream/60 px-4 py-3 text-[0.95rem] outline-none focus:bg-white focus:ring-4 focus:ring-blush/40";
