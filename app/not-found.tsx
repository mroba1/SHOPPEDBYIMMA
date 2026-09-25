import Link from "next/link";
import { site } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-charcoal px-6 text-center text-cream">
      <div>
        <p className="font-display text-sm font-light tracking-[0.3em]">{site.wordmark}</p>
        <p className="font-serif mt-10 text-[7rem] leading-none text-blush italic">404</p>
        <h1 className="mt-4 text-2xl font-light">We couldn&apos;t find that page.</h1>
        <p className="mt-2 text-cream/70">If you&apos;re looking for an order, check the code and try again.</p>
        <Link href="/" className="btn btn-blush mt-10">Back to the shop</Link>
      </div>
    </main>
  );
}
