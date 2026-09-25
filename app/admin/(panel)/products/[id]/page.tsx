import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getProductById, listCategories } from "@/lib/data/repo";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), listCategories()]);
  if (!product) notFound();
  return <ProductForm key={product.updatedAt} product={product} categories={categories} />;
}
