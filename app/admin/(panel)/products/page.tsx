import Link from "next/link";
import { listCategories, listProducts } from "@/lib/data/repo";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { CheckCircle, PlusIcon } from "@/components/ui/Icons";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const [products, categories, sp] = await Promise.all([listProducts(), listCategories(), searchParams]);
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl italic">Products</h1>
          <p className="mt-1 text-sm text-taupe">{products.length} products · tap availability to switch between available and sold out</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-dark shrink-0 !min-h-11 !px-5 !text-[0.7rem]">
          <PlusIcon width={16} height={16} /> <span className="hidden sm:inline">Add product</span><span className="sm:hidden">Add</span>
        </Link>
      </div>
      {sp.created && (
        <p className="animate-rise mt-6 flex items-center gap-2 rounded-2xl bg-blush/50 px-4 py-3 text-sm font-medium">
          <CheckCircle width={18} height={18} /> Product added. It&apos;s live in the shop now.
        </p>
      )}
      <div className="mt-8">
        <AdminProductTable products={products} categories={categories} />
      </div>
    </div>
  );
}
