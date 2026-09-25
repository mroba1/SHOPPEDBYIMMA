import { requireAdmin } from "@/lib/auth";
import { listCategories, suggestProductCode } from "@/lib/data/repo";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategories();
  const suggestedCode = categories[0] ? await suggestProductCode(categories[0].slug) : "";
  return <ProductForm categories={categories} suggestedCode={suggestedCode} />;
}
