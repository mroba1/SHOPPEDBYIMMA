import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ArrowUpRight } from "@/components/ui/Icons";

export function CategoryCard({ category, count, className }: { category: Category; count?: number; className?: string }) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      className={cn("group relative block overflow-hidden rounded-[2px] bg-espresso text-cream", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={category.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-4 sm:p-6">
        {typeof count === "number" && (
          <span className="mb-auto self-start rounded-full bg-cream/15 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.14em] uppercase backdrop-blur-sm">
            {count} item{count === 1 ? "" : "s"}
          </span>
        )}
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base leading-tight font-semibold sm:text-xl">{category.name}</h3>
            <p className="font-serif mt-1 hidden text-lg italic text-nude sm:block">{category.tagline}</p>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blush text-charcoal transition-transform duration-500 group-hover:rotate-45 sm:size-11">
            <ArrowUpRight width={18} height={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
