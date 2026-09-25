import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";

export interface SummaryLine {
  key: string;
  name: string;
  code: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

/** Compact, read-only list of items + total. Used on checkout and confirmation. */
export function OrderSummary({ lines, title = "Order summary" }: { lines: SummaryLine[]; title?: string }) {
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  return (
    <section className="rounded-3xl bg-white/70 p-5 ring-1 ring-charcoal/8 sm:p-7">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl italic">{title}</h2>
        <span className="text-xs tracking-[0.14em] text-taupe uppercase">{count} item{count === 1 ? "" : "s"}</span>
      </div>
      <ul className="mt-5 divide-y divide-charcoal/8">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-3.5 py-3.5">
            <div className="relative shrink-0">
              <ProductImage src={l.image} alt={l.name} className="aspect-[4/5] w-16 rounded-md" />
              <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-charcoal text-[0.65rem] font-bold text-cream">{l.quantity}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{l.name}</p>
              <p className="code-label mt-0.5 text-taupe">{l.code}</p>
              <p className="mt-0.5 text-xs text-espresso/75">{[l.size && `Size ${l.size}`, l.color].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold">{formatPrice(l.price * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-2 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
        <div className="flex justify-between text-espresso/80">
          <span>Delivery</span>
          <span>Confirmed on WhatsApp</span>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs font-semibold tracking-[0.16em] uppercase">Total</span>
          <span className="text-2xl font-semibold">{formatPrice(total)}</span>
        </div>
      </div>
    </section>
  );
}
