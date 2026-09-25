import { requireAdmin } from "@/lib/auth";
import { listCategories, listProducts } from "@/lib/data/repo";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin();
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;

  return (
    <div>
      <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight sm:text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-taupe">These appear on the home page and in the shop filters. Each has a code prefix for its product codes.</p>
      <div className="mt-6">
        <CategoryManager categories={categories} counts={counts} />
      </div>
    </div>
  );
}
