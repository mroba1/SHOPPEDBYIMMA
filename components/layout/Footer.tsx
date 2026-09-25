import Link from "next/link";
import type { Category } from "@/lib/types";
import { site } from "@/lib/config";
import { whatsappLink, generalMessage } from "@/lib/whatsapp";
import { DotGrid } from "@/components/ui/Brand";
import { ArrowRight, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/Icons";

// Mirrors the blush band at the bottom of the flyer.
export function Footer({ categories }: { categories: Pick<Category, "slug" | "name">[] }) {
  return (
    <footer className="relative overflow-hidden bg-blush text-charcoal">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-light tracking-[0.22em] sm:text-3xl">{site.wordmark}</p>
            <p className="font-script mt-1 pl-4 text-2xl text-espresso">{site.tagline}</p>
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-espresso/85">{site.description}</p>
            <a href={whatsappLink(generalMessage)} target="_blank" rel="noopener" className="btn btn-dark mt-8">
              Order now <ArrowRight width={18} height={18} />
            </a>
          </div>

          <div>
            <p className="eyebrow">Shop</p>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              <li><Link href="/shop" className="link-underline">Shop everything</Link></li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`} className="link-underline">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Say hello</p>
            <ul className="mt-5 space-y-4 text-[1.05rem]">
              <li>
                <a href={site.instagram} target="_blank" rel="noopener" className="inline-flex items-center gap-3 hover:underline">
                  <InstagramIcon /> {site.handle}
                </a>
              </li>
              <li>
                <a href={site.tiktok} target="_blank" rel="noopener" className="inline-flex items-center gap-3 hover:underline">
                  <TikTokIcon /> {site.handle}
                </a>
              </li>
              <li>
                <a href={whatsappLink(generalMessage)} target="_blank" rel="noopener" className="inline-flex items-center gap-3 hover:underline">
                  <WhatsAppIcon /> {site.whatsappDisplay}
                </a>
              </li>
            </ul>
            <DotGrid rows={2} className="mt-10 [&>span]:bg-charcoal/80" />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-charcoal/15 pt-6 text-xs tracking-[0.08em] text-espresso/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Independent personal shopper, not affiliated with SHEIN.</p>
          <Link href="/account" className="hover:underline">My account</Link>
        </div>
      </div>
    </footer>
  );
}
