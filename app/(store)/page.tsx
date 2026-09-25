import Link from "next/link";
import { listCategories, listProducts } from "@/lib/data/repo";
import { editorial } from "@/lib/data/seed";
import { site } from "@/lib/config";
import { generalMessage, whatsappLink } from "@/lib/whatsapp";
import { CategoryCard } from "@/components/product/CategoryCard";
import { ProductGrid } from "@/components/product/ProductCard";
import { DotGrid, Polaroid } from "@/components/ui/Brand";
import { ArrowRight, BagIcon, CheckCircle, ChatIcon, ShieldIcon, TruckIcon, WalletIcon, WhatsAppIcon } from "@/components/ui/Icons";

export default async function HomePage() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  const available = products.filter((p) => p.available);
  const featured = [...available.filter((p) => p.featured), ...available.filter((p) => !p.featured)].slice(0, 8);
  const counts = Object.fromEntries(categories.map((c) => [c.slug, products.filter((p) => p.categorySlug === c.slug).length]));

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="relative isolate overflow-hidden bg-charcoal text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={editorial.hero} alt="" className="ken-burns absolute inset-0 -z-20 size-full object-cover object-[60%_center] opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/30 lg:bg-gradient-to-r lg:from-charcoal lg:via-charcoal/70 lg:to-charcoal/10" />
        <div className="grid-lines pointer-events-none absolute inset-0 -z-10 hidden lg:block" />

        <div className="relative mx-auto flex min-h-[calc(100svh-6.5rem)] max-w-7xl flex-col px-5 pt-10 pb-10 sm:px-6 lg:min-h-[44rem] lg:px-10 lg:pt-16 lg:pb-14">
          <DotGrid rows={4} className="reveal hidden opacity-80 sm:grid" />

          {/* Polaroids */}
          <div className="pointer-events-none absolute top-8 right-4 w-32 rotate-[5deg] sm:top-12 sm:right-8 sm:w-44 lg:top-12 lg:right-[24%] lg:w-52">
            <Polaroid src={editorial.redDress} alt="Red dress" caption="new in ✦" className="reveal [animation-delay:350ms]" />
          </div>
          <div className="pointer-events-none absolute right-8 hidden w-40 -rotate-[4deg] lg:top-[8.5rem] lg:right-10 lg:block">
            <Polaroid src={editorial.studio} alt="" className="reveal [animation-delay:550ms]" />
          </div>

          <div className="mt-auto max-w-3xl pt-44 sm:pt-56 lg:pt-10">
            <p className="font-script reveal text-2xl text-blush sm:text-3xl">{site.tagline}</p>
            <h1 className="reveal mt-2 [animation-delay:100ms]">
              <span className="block text-[3.3rem] leading-[0.95] font-light tracking-[0.04em] uppercase sm:text-7xl lg:text-8xl">Shopping</span>
              <span className="font-serif block text-[3.9rem] leading-[0.9] italic sm:text-[5.5rem] lg:text-[7.5rem]">made easy.</span>
            </h1>
          </div>

          <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[1fr_28rem] lg:items-end">
            <p className="reveal hidden max-w-xs text-[0.7rem] leading-relaxed font-semibold tracking-[0.2em] text-nude uppercase [animation-delay:250ms] lg:block">
              Fashion · Home finds <br /> Kids&apos; essentials · &amp; more
            </p>
            <div className="reveal [animation-delay:200ms]">
              <p className="max-w-md text-[1.02rem] leading-relaxed text-cream/85">
                Fashion, accessories, kids&apos; essentials, home finds and more — conveniently sourced and ordered from the comfort of your home.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="btn btn-blush">
                  Shop now <ArrowRight width={18} height={18} />
                </Link>
                <a href={whatsappLink(generalMessage)} target="_blank" rel="noopener" className="btn btn-ghost-light">
                  <WhatsAppIcon width={18} height={18} /> Order via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark wordmark, like the faded LUMEN in the reference */}
        <p aria-hidden className="font-display pointer-events-none absolute -bottom-[0.18em] left-1/2 -z-10 -translate-x-1/2 text-[28vw] leading-none font-light tracking-[0.08em] whitespace-nowrap text-cream/[0.04] lg:text-[18rem]">
          IMMA
        </p>
      </section>

      {/* ───────────── FLYER CHECKLIST MARQUEE ───────────── */}
      <div className="overflow-hidden border-y border-charcoal/10 bg-blush py-4 text-charcoal">
        <div className="animate-marquee flex w-max gap-10">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-10" aria-hidden={dup === 1}>
              {categories.map((c) => (
                <span key={c.slug} className="flex items-center gap-2.5 text-sm font-bold tracking-[0.12em] whitespace-nowrap uppercase">
                  <CheckCircle width={20} height={20} /> {c.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ───────────── CATEGORIES ───────────── */}
      <section id="categories" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
        <SectionHeading eyebrow="Shop by category" title="Everything you love" accent="in one place." action={{ href: "/shop", label: "Shop all" }} />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} count={counts[c.slug]} className={i === 0 ? "col-span-2 aspect-[16/10] lg:col-span-1 lg:aspect-[4/5]" : "aspect-[4/5]"} />
          ))}
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="relative overflow-hidden bg-charcoal text-cream">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1fr_1.35fr] lg:gap-20 lg:px-10 lg:py-28">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow text-blush">How it works</p>
            <h2 className="mt-4 text-4xl leading-[1.05] font-light sm:text-5xl">
              Your SHEIN errand, <span className="font-serif text-[1.15em] text-blush italic">sorted.</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-cream/75">
              No card details, no complicated checkout. Pick what you love, get an order code, and finish everything with a real person on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-nude">
              <span className="flex items-center gap-2"><ShieldIcon width={18} height={18} className="text-blush" /> No online payment</span>
              <span className="flex items-center gap-2"><TruckIcon width={18} height={18} className="text-blush" /> Delivered to your door</span>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: BagIcon, title: "Add to cart", body: "Browse, choose your size and colour, and add everything you want to your cart." },
              { icon: CheckCircle, title: "Get your order code", body: "Checkout takes a minute — just your name, WhatsApp number and address. You'll get a code like SBM-7K42P." },
              { icon: ChatIcon, title: "Send it on WhatsApp", body: "Tap one button and your code is sent to Imma, who confirms your items are available." },
              { icon: WalletIcon, title: "Pay & relax", body: "Pay directly after confirmation. We source, pack and deliver — with updates all the way." },
            ].map((s, i) => (
              <li key={s.title} className="group rounded-3xl bg-white/[0.04] p-6 ring-1 ring-blush/15 transition duration-500 hover:bg-white/[0.07] hover:ring-blush/40 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-full bg-blush text-charcoal transition-transform duration-500 group-hover:-rotate-12">
                    <s.icon width={22} height={22} />
                  </span>
                  <span className="font-serif text-5xl text-blush/35 italic">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── NEW IN ───────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
        <SectionHeading eyebrow="Handpicked" title="New in" accent="this week." action={{ href: "/shop", label: "View all" }} />
        <ProductGrid products={featured} className="mt-10" />
      </section>

      {/* ───────────── FLYER EDITORIAL ───────────── */}
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:px-10 lg:py-28">
          <div className="relative order-2 lg:order-1">
            <p className="font-display text-3xl font-light tracking-[0.2em] sm:text-4xl">{site.wordmark}</p>
            <p className="font-script mt-1 pl-6 text-3xl text-blush">{site.tagline}</p>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-cream/85">{site.description}</p>
            <p className="mt-4 max-w-md leading-relaxed text-cream/70">From fashion to home finds, kids&apos; essentials and more, we&apos;ve got you covered.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn btn-blush">Start shopping <ArrowRight width={18} height={18} /></Link>
              <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-ghost-light">Follow @{site.handle.toLowerCase()}</a>
            </div>
          </div>
          <div className="relative order-1 mx-auto h-[26rem] w-full max-w-md sm:h-[32rem] lg:order-2">
            <DotGrid rows={3} className="absolute bottom-6 left-0" />
            <Polaroid src={editorial.hatPortrait} alt="" className="absolute top-0 left-[6%] w-[58%] -rotate-[4deg]" />
            <Polaroid src={featured[1]?.images[0] ?? editorial.studio} alt="" caption="shop the look" className="absolute right-0 bottom-0 w-[52%] rotate-[5deg]" />
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, accent, action }: { eyebrow: string; title: string; accent: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow text-taupe">{eyebrow}</p>
        <h2 className="mt-3 text-[2.1rem] leading-[1.05] font-light sm:text-5xl">
          {title} <span className="font-serif text-[1.12em] italic">{accent}</span>
        </h2>
      </div>
      {action && (
        <Link href={action.href} className="group hidden shrink-0 items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase sm:inline-flex">
          <span className="link-underline">{action.label}</span>
          <ArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
