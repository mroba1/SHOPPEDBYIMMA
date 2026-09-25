"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/lib/actions/orders";
import { cn } from "@/lib/cn";
import { useCart } from "@/components/cart/CartProvider";
import { ArrowLeft, CheckIcon, ShieldIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { OrderSummary } from "./OrderSummary";

export interface CheckoutProfile {
  name: string;
  whatsapp: string;
  address?: string;
}

/** `profile` is set only when the customer is signed in to their (optional) account. */
export function CheckoutForm({ profile }: { profile?: CheckoutProfile | null }) {
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [placed, setPlaced] = useState(false);
  const [values, setValues] = useState({ name: profile?.name ?? "", whatsapp: profile?.whatsapp ?? "", address: profile?.address ?? "", note: "" });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (error?.field === k) setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await placeOrder({
        ...values,
        lines: lines.map((l) => ({ productId: l.productId, size: l.size, color: l.color, quantity: l.quantity })),
      });
      if (!res.ok) {
        setError({ message: res.error, field: res.field });
        if (res.field) document.getElementById(res.field)?.focus();
        return;
      }
      try {
        sessionStorage.setItem("sbi-last-order", res.code);
      } catch {}
      setPlaced(true);
      router.push(`/order/${res.code}?new=1`);
      clear();
    });
  };

  if (placed) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <span className="size-8 animate-spin rounded-full border-2 border-charcoal/15 border-t-charcoal" />
        <p className="font-serif mt-6 text-3xl italic">Preparing your order code…</p>
      </div>
    );
  }

  if (!ready) return <div className="h-96 animate-pulse rounded-3xl bg-linen" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-serif text-4xl italic">Your cart is empty</p>
        <p className="mt-3 text-taupe">Add a few pieces first, then come back to check out.</p>
        <Link href="/shop" className="btn btn-dark mt-8">Browse the shop</Link>
      </div>
    );
  }

  const summary = lines.map((l) => ({ key: l.key, name: l.name, code: l.productCode, image: l.image, price: l.price, quantity: l.quantity, size: l.size, color: l.color }));

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:gap-14">
      <div className="order-2 lg:order-1">
        {profile ? (
          <p className="mb-6 flex items-center gap-2 rounded-2xl bg-blush/35 px-4 py-3 text-sm">
            <CheckIcon width={16} height={16} className="shrink-0" /> Signed in as {profile.name}. This order will be saved to your account.
          </p>
        ) : (
          <p className="mb-6 rounded-2xl bg-linen/80 px-4 py-3 text-sm text-espresso">
            Checking out as a guest. No account needed.{" "}
            <Link href="/account/login?next=/checkout" className="font-semibold underline underline-offset-4">Sign in</Link> if you have one (optional).
          </p>
        )}
        <div className="space-y-5">
          <Input id="name" label="Full name" autoComplete="name" value={values.name} onChange={set("name")} error={error?.field === "name"} placeholder="e.g. Jane Doe" />
          <Input
            id="whatsapp"
            label="WhatsApp number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.whatsapp}
            onChange={set("whatsapp")}
            error={error?.field === "whatsapp"}
            placeholder="0803 123 4567"
            hint="We'll only use this to confirm your order."
          />
          <Textarea id="address" label="Delivery address" autoComplete="street-address" value={values.address} onChange={set("address")} error={error?.field === "address"} placeholder="House number, street, area, city, state" rows={3} />
          <Textarea id="note" label="Note (optional)" value={values.note} onChange={set("note")} placeholder="Anything we should know? Preferred delivery time, landmarks…" rows={2} />
        </div>

        {error && (
          <p role="alert" className="animate-rise mt-5 rounded-2xl bg-rouge/10 px-4 py-3 text-sm text-rouge">
            {error.message}
          </p>
        )}

        <div className="mt-8 rounded-2xl bg-linen p-5 text-sm leading-relaxed text-espresso">
          <p className="flex items-center gap-2 font-semibold">
            <ShieldIcon width={18} height={18} /> No payment is taken on this website
          </p>
          <p className="mt-1.5 text-espresso/80">
            You&apos;ll get an order code. Send it to us on WhatsApp, we confirm your items are available, then you pay directly to ShoppedByImma.
          </p>
        </div>

        {/* Sticky on phones so the main action is always under the thumb */}
        <div className="sticky bottom-0 z-10 -mx-5 mt-8 bg-gradient-to-t from-cream via-cream to-cream/0 px-5 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:static sm:mx-0 sm:bg-none sm:p-0">
          <button type="submit" disabled={pending} className="btn btn-dark w-full disabled:opacity-70">
            {pending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" /> Creating your order…
              </>
            ) : (
              <>
                <WhatsAppIcon width={18} height={18} /> Create my order
              </>
            )}
          </button>
        </div>
        <Link href="/cart" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-taupe uppercase hover:text-charcoal">
          <ArrowLeft width={16} height={16} /> Back to cart
        </Link>
      </div>

      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-28">
          <OrderSummary lines={summary} />
        </div>
      </div>
    </form>
  );
}

const fieldCls = (error?: boolean) =>
  cn(
    "w-full rounded-2xl border bg-white/80 px-4 py-3.5 text-base text-charcoal outline-none transition placeholder:text-taupe/70 focus:bg-white focus:ring-4",
    error ? "border-rouge/70 focus:ring-rouge/10" : "border-charcoal/15 focus:border-charcoal/50 focus:ring-blush/40",
  );

function Input({ id, label, hint, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: string; error?: boolean }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-semibold tracking-[0.14em] uppercase">{label}</span>
      <input id={id} name={id} aria-invalid={error} className={fieldCls(error)} {...props} />
      {hint && <span className="mt-1.5 block text-xs text-taupe">{hint}</span>}
    </label>
  );
}

function Textarea({ id, label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string; error?: boolean }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-semibold tracking-[0.14em] uppercase">{label}</span>
      <textarea id={id} name={id} aria-invalid={error} className={cn(fieldCls(error), "resize-none")} {...props} />
    </label>
  );
}
