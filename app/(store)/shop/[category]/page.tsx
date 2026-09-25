import { notFound } from "next/navigation";
import { getCategory, listCategories, listProducts } from "@/lib/data/repo";
import { ShopView } from "@/components/product/ShopView";

export async function generateMetadata({ params }: PageProps<"/shop/[category]">) {
  const cat = await getCategory((await params).category);
  return { title: cat?.name ?? "Shop" };
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category: slug } = await params;
  const [category, categories, products] = await Promise.all([getCategory(slug), listCategories(), listProducts({ category: slug })]);
  if (!category) notFound();

  return (
    <>
      <header className="relative isolate overflow-hidden bg-charcoal text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={category.image} alt="" className="ken-burns absolute inset-0 -z-10 size-full object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
        <div className="mx-auto max-w-7xl px-5 pt-24 pb-10 sm:px-6 lg:px-10 lg:pt-36 lg:pb-14">
          <p className="eyebrow reveal text-blush">Category</p>
          <h1 className="reveal mt-3 text-5xl leading-none font-light [animation-delay:80ms] sm:text-7xl">{category.name}</h1>
          <p className="font-serif reveal mt-3 text-2xl text-nude italic [animation-delay:160ms]">{category.tagline}</p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-10">
        <ShopView products={products} categories={categories} active={slug} />
      </div>
    </>
  );
}
