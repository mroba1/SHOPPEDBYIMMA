"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ui/ProductImage";
import { CloseIcon, ImageIcon, PlusIcon } from "@/components/ui/Icons";

/** Shrinks phone photos (often 4–8MB) to a crisp ~1200px JPEG before uploading. */
async function resize(file: File, max = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function ImageUploader({ value, onChange, multiple = true }: { value: string[]; onChange: (urls: string[]) => void; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const next = [...value];
    for (const f of Array.from(files).slice(0, multiple ? 6 : 1)) {
      try {
        const res = await uploadImage(await resize(f));
        if (res.ok) next.push(res.url);
        else setError(res.error);
      } catch {
        setError("Couldn't read that image. Try a JPG or PNG.");
      }
    }
    onChange(multiple ? next : next.slice(-1));
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  const addUrl = () => {
    const u = urlDraft.trim();
    if (!/^https?:\/\//.test(u)) return setError("Paste a full image link starting with https://");
    onChange(multiple ? [...value, u] : [u]);
    setUrlDraft("");
    setError(null);
  };

  return (
    <div>
      <div className={cn("grid gap-3", multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
        {value.map((src, i) => (
          <div key={src + i} className="group relative">
            <ProductImage src={src} alt="" className="aspect-[4/5] w-full rounded-xl" />
            {i === 0 && multiple && <span className="absolute bottom-2 left-2 rounded-full bg-charcoal/85 px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] text-cream uppercase">Main</span>}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-cream/95 text-charcoal shadow"
              aria-label="Remove image"
            >
              <CloseIcon width={14} height={14} />
            </button>
            {multiple && i > 0 && (
              <button type="button" onClick={() => onChange([src, ...value.filter((_, j) => j !== i)])} className="absolute bottom-2 left-2 rounded-full bg-cream/95 px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] text-charcoal uppercase opacity-0 transition group-hover:opacity-100">
                Make main
              </button>
            )}
          </div>
        ))}
        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-charcoal/20 bg-cream text-taupe transition hover:border-charcoal/50 hover:text-charcoal"
          >
            {busy ? <span className="size-6 animate-spin rounded-full border-2 border-charcoal/20 border-t-charcoal" /> : value.length ? <PlusIcon /> : <ImageIcon width={26} height={26} />}
            <span className="px-2 text-center text-xs font-semibold">{busy ? "Uploading…" : value.length ? "Add photo" : "Upload photo"}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} hidden onChange={(e) => onFiles(e.target.files)} />
      <div className="mt-3 flex gap-2">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          placeholder="…or paste an image link"
          className="h-10 min-w-0 flex-1 rounded-full border border-charcoal/15 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blush"
        />
        <button type="button" onClick={addUrl} className="h-10 rounded-full bg-charcoal/8 px-4 text-xs font-semibold hover:bg-charcoal/15">Add</button>
      </div>
      {error && <p className="mt-2 text-sm text-rouge">{error}</p>}
    </div>
  );
}
