import Link from "next/link";
import { site } from "@/lib/config";
import { cn } from "@/lib/cn";

export function Wordmark({ className, withTagline = false }: { className?: string; withTagline?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex flex-col leading-none", className)} aria-label={`${site.name} home`}>
      <span className="font-display text-[1.05rem] font-light tracking-[0.22em] sm:text-lg">{site.wordmark}</span>
      {withTagline && <span className="font-script -mt-0.5 pl-3 text-lg text-blush">{site.tagline}</span>}
    </Link>
  );
}

/** The 2×N dot column from the flyer, used as a quiet decorative accent. */
export function DotGrid({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("grid w-fit grid-cols-2 gap-x-4 gap-y-4", className)}>
      {Array.from({ length: rows * 2 }).map((_, i) => (
        <span key={i} className="size-2 rounded-full bg-blush" />
      ))}
    </div>
  );
}

/** Blush polaroid frame, straight from the flyer. */
export function Polaroid({
  src,
  alt,
  caption,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure className={cn("bg-blush p-2.5 pb-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] sm:p-3.5", className)}>
      <div className="border-[6px] border-charcoal bg-charcoal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={cn("aspect-[4/5] w-full object-cover", imgClassName)} />
      </div>
      {caption && <figcaption className="font-script mt-1.5 text-center text-xl leading-none text-charcoal">{caption}</figcaption>}
    </figure>
  );
}
