import { listCategories, listProducts } from "@/lib/data/repo";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;

  return (
    <div>
      <h1 className="font-serif text-4xl italic">Categories</h1>
      <p className="mt-1 text-sm text-taupe">These appear on the home page and in the shop filters. Each has a code prefix for its product codes.</p>
      <div className="mt-6">
        <CategoryManager categories={categories} counts={counts} />
      </div>
    </div>
  );
}
