import type { Metadata } from "next";
import { listCategories, listProducts } from "@/lib/data/repo";
import { ShopView } from "@/components/product/ShopView";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-10">
      <header className="pt-10 pb-8 lg:pt-16">
        <p className="eyebrow text-taupe">The edit</p>
        <h1 className="mt-3 text-5xl leading-none font-light sm:text-6xl">
          Shop <span className="font-serif text-[1.12em] italic">everything</span>
        </h1>
        <p className="mt-4 max-w-lg text-espresso/80">Fashion, home finds, kids&apos; essentials and more. Add to your cart, get an order code, confirm on WhatsApp.</p>
      </header>
      <ShopView products={products} categories={categories} />
    </div>
  );
}
