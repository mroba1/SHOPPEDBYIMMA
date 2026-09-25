import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByCode } from "@/lib/data/repo";
import { normalizeOrderCode } from "@/lib/format";
import { site } from "@/lib/config";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { WhatsAppCheckoutButton } from "@/components/checkout/WhatsAppCheckoutButton";
import { CopyCode } from "@/components/checkout/CopyCode";
import { DotGrid } from "@/components/ui/Brand";
import { CheckCircle } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderConfirmationPage({ params }: PageProps<"/order/[code]">) {
  const code = normalizeOrderCode((await params).code);
  const order = await getOrderByCode(code);
  if (!order) notFound();

  // Only items + total are shown here — never the customer's phone or address.
  const lines = order.items.map((i, idx) => ({ key: String(idx), name: i.name, code: i.productCode, image: i.image, price: i.unitPrice, quantity: i.quantity, size: i.size, color: i.color }));

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
        <DotGrid rows={3} className="absolute top-8 right-6 opacity-70 sm:right-10" />
        <div className="relative mx-auto max-w-2xl px-5 pt-14 pb-24 text-center sm:pt-20">
          <span className="animate-pop mx-auto grid size-16 place-items-center rounded-full bg-blush text-charcoal">
            <CheckCircle width={30} height={30} />
          </span>
          <p className="eyebrow reveal mt-7 text-blush [animation-delay:100ms]">Your order is ready</p>
          <h1 className="reveal mt-3 text-4xl leading-tight font-light [animation-delay:180ms] sm:text-5xl">
            Your order has been <span className="font-serif text-[1.12em] italic">created.</span>
          </h1>
          <p className="reveal mx-auto mt-4 max-w-md text-cream/80 [animation-delay:260ms]">
            Your selected items have been saved. Send this order code to {site.name} on WhatsApp so we can confirm your items and arrange payment.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-2xl px-5 pb-20">
        {/* The ticket */}
        <div className="reveal rounded-3xl bg-blush p-2.5 shadow-[0_30px_60px_-25px_rgba(41,40,35,0.55)] [animation-delay:320ms]">
          <div className="rounded-[1.1rem] border-2 border-dashed border-charcoal/25 bg-cream px-6 py-8 text-center">
            <p className="text-[0.7rem] font-bold tracking-[0.24em] text-taupe uppercase">Order code</p>
            <p className="mt-2 font-mono text-[2.6rem] leading-none font-semibold tracking-[0.08em] sm:text-6xl">{order.code}</p>
            <div className="mt-5 flex justify-center">
              <CopyCode code={order.code} />
            </div>
          </div>
        </div>

        <div className="reveal mt-6 [animation-delay:420ms]">
          <WhatsAppCheckoutButton code={order.code} label="Continue to WhatsApp" />
          <p className="mt-3 text-center text-xs text-taupe">Opens WhatsApp with your order code already typed in. Just press send.</p>
        </div>

        <section className="mt-12">
          <h2 className="eyebrow text-taupe">What happens next</h2>
          <ol className="mt-5 space-y-5">
            {[
              ["Send your code", "Tap the button above and send the message to us on WhatsApp."],
              ["We confirm your items", "Imma checks that everything is available on SHEIN and replies with your total and payment details."],
              ["Pay on WhatsApp", "Transfer directly and share your receipt. No card details on this site, ever."],
              ["Sit back", "We source, pack and deliver your order, with updates along the way."],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-4">
                <span className="font-serif grid size-9 shrink-0 place-items-center rounded-full bg-charcoal text-lg text-blush italic">{i + 1}</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-0.5 text-sm text-espresso/80">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-12">
          <OrderSummary lines={lines} title="Your items" />
        </div>

        <p className="mt-8 text-center text-sm text-taupe">
          Save this page or screenshot your code.{" "}
          <Link href="/shop" className="font-semibold text-charcoal underline underline-offset-4">Keep shopping</Link>
        </p>
      </div>
    </>
  );
}
