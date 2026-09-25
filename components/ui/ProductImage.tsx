"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** <img> with a soft fade-in and a branded fallback if a photo fails to load. */
export function ProductImage({ src, alt, className, eager }: { src?: string; alt: string; className?: string; eager?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Images already in the browser cache can finish before React hydrates,
  // in which case onLoad never fires — check once on mount.
  useEffect(() => {
    const el = ref.current;
    if (el?.complete) {
      if (el.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center bg-linen", className)} role="img" aria-label={alt}>
        <span className="font-display text-xs tracking-[0.3em] text-taupe">SBI</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn("bg-linen object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0", className)}
    />
  );
}
