"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ui/ProductImage";

/** Swipeable on phones (scroll-snap), thumbnail rail on desktop. */
export function ProductGallery({ images, name, soldOut }: { images: string[]; name: string; soldOut?: boolean }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [""];

  const go = (i: number) => {
    setIndex(i);
    track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="lg:grid lg:grid-cols-[4.5rem_1fr] lg:gap-4">
      {list.length > 1 && (
        <div className="hidden flex-col gap-3 lg:flex">
          {list.map((src, i) => (
            <button key={i} onClick={() => go(i)} className={cn("overflow-hidden rounded-md ring-2 transition", i === index ? "ring-charcoal" : "ring-transparent opacity-70 hover:opacity-100")} aria-label={`Show image ${i + 1}`}>
              <ProductImage src={src} alt="" className="aspect-[4/5] w-full" />
            </button>
          ))}
        </div>
      )}
      <div className={cn("relative", list.length <= 1 && "lg:col-span-2")}>
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto sm:rounded-sm"
        >
          {list.map((src, i) => (
            <div key={i} className="w-full shrink-0 snap-center overflow-hidden">
              <ProductImage src={src} alt={`${name}${list.length > 1 ? ` — photo ${i + 1}` : ""}`} eager={i === 0} className={cn("aspect-[4/5] w-full", soldOut && "grayscale-[50%]")} />
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
            {list.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full bg-cream transition-all", i === index ? "w-5" : "w-1.5 opacity-60")} />
            ))}
          </div>
        )}
        {soldOut && <span className="absolute top-4 left-4 rounded-full bg-charcoal px-3 py-1.5 text-[0.68rem] font-bold tracking-[0.14em] text-cream uppercase">Sold out</span>}
      </div>
    </div>
  );
}
