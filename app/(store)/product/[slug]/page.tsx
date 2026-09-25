import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getProductBySlug, listProducts } from "@/lib/data/repo";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductGrid } from "@/components/product/ProductCard";
import { ChatIcon, ShieldIcon, TruckIcon } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const p = await getProductBySlug((await params).slug);
  return p ? { title: p.name, description: p.description, openGraph: { images: p.images.slice(0, 1) } } : { title: "Product" };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [category, siblings] = await Promise.all([getCategory(product.categorySlug), listProducts({ category: product.categorySlug })]);
  const related = siblings.filter((p) => p.id !== product.id && p.available).slice(0, 4);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="mx-auto max-w-7xl pb-16 sm:px-6 lg:px-10">
      <nav className="hidden items-center gap-2 py-6 text-xs tracking-[0.1em] text-taupe uppercase sm:flex" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-charcoal">Shop</Link>
        <span>/</span>
        {category && (
          <>
            <Link href={`/shop/${category.slug}`} className="hover:text-charcoal">{category.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="truncate text-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery images={product.images} name={product.name} soldOut={!product.available} />

        <div className="px-5 sm:px-0 lg:sticky lg:top-28 lg:self-start">
          {category && (
            <Link href={`/shop/${category.slug}`} className="eyebrow text-taupe hover:text-charcoal">
              {category.name}
            </Link>
          )}
          <h1 className="mt-3 text-3xl leading-tight font-light sm:text-4xl">{product.name}</h1>
          <p className="mt-2 inline-block rounded-md bg-linen px-2 py-1 font-mono text-xs tracking-wider text-espresso">Code: {product.code}</p>
          <p className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
            {onSale && <span className="text-lg text-taupe line-through">{formatPrice(product.compareAtPrice!)}</span>}
            {onSale && <span className="rounded-full bg-blush px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] uppercase">Save {formatPrice(product.compareAtPrice! - product.price)}</span>}
          </p>
          <p className="mt-6 leading-relaxed text-espresso/85">{product.description}</p>

          <div className="mt-8 border-t border-charcoal/10 pt-8">
            <ProductPurchase product={product} />
          </div>

          <ul className="mt-8 space-y-4 rounded-3xl bg-linen/70 p-5 text-sm sm:p-6">
            <li className="flex gap-3">
              <ShieldIcon width={20} height={20} className="mt-0.5 shrink-0" />
              <span><strong className="font-semibold">No payment on the website.</strong> Checkout gives you an order code; you pay only after we confirm on WhatsApp.</span>
            </li>
            <li className="flex gap-3">
              <ChatIcon width={20} height={20} className="mt-0.5 shrink-0" />
              <span><strong className="font-semibold">Real person, real replies.</strong> Questions about sizing? Just ask.</span>
            </li>
            <li className="flex gap-3">
              <TruckIcon width={20} height={20} className="mt-0.5 shrink-0" />
              <span><strong className="font-semibold">Delivered to you.</strong> Delivery fee and timeline confirmed on WhatsApp.</span>
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 px-5 sm:px-0">
          <h2 className="text-3xl font-light">
            You may <span className="font-serif text-[1.12em] italic">also love</span>
          </h2>
          <ProductGrid products={related} className="mt-8" />
        </section>
      )}
    </div>
  );
}
