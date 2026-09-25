"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import {
  deleteCategory,
  deleteProduct,
  saveCategory,
  saveUpload,
  saveProduct,
  setProductAvailability,
  suggestProductCode,
  type ProductInput,
} from "@/lib/data/repo";

type Result = { ok: true; id?: string } | { ok: false; error: string };

const refresh = () => {
  revalidatePath("/", "layout");
};

// ---------- Auth ----------

export async function login(_: { error?: string } | undefined, form: FormData) {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) return { error: "That password isn't right. Please try again." };
  await startSession();
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- Uploads ----------

/** Stores a (client-resized) image and returns its public URL. */
export async function uploadImage(dataUrl: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin();
  const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(dataUrl);
  if (!match) return { ok: false, error: "Please upload a JPG, PNG or WEBP image." };
  try {
    const url = await saveUpload(match[2], match[1] === "jpeg" ? "jpg" : (match[1] as "png" | "webp"));
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed." };
  }
}

// ---------- Products ----------

export async function nextProductCode(categorySlug: string) {
  await requireAdmin();
  return suggestProductCode(categorySlug);
}

export async function saveProductAction(input: ProductInput & { id?: string }): Promise<Result> {
  await requireAdmin();
  const clean = (arr: string[]) => [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
  if (!input.name?.trim()) return { ok: false, error: "Give the product a name." };
  if (!/^[A-Z0-9-]{3,20}$/i.test(input.code?.trim() ?? "")) return { ok: false, error: "Product code should look like SBM-FA-005 (letters, numbers and dashes)." };
  if (!Number.isFinite(input.price) || input.price <= 0) return { ok: false, error: "Enter a price greater than zero." };
  if (!input.categorySlug) return { ok: false, error: "Choose a category." };
  if (!input.images?.length) return { ok: false, error: "Add at least one product photo so you can recognise it in orders." };
  try {
    const p = await saveProduct({
      ...input,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      price: Math.round(input.price),
      compareAtPrice: input.compareAtPrice && input.compareAtPrice > input.price ? Math.round(input.compareAtPrice) : undefined,
      sizes: clean(input.sizes ?? []),
      colors: clean(input.colors ?? []),
    });
    refresh();
    return { ok: true, id: p.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save product." };
  }
}

export async function toggleAvailabilityAction(id: string, available: boolean) {
  await requireAdmin();
  await setProductAvailability(id, available);
  refresh();
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await deleteProduct(id);
  refresh();
}

// ---------- Categories ----------

export async function saveCategoryAction(input: { id?: string; name: string; tagline: string; image: string; codePrefix: string }): Promise<Result> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Give the category a name." };
  if (!/^[A-Z]{2,3}$/i.test(input.codePrefix.trim())) return { ok: false, error: "Code prefix should be 2–3 letters, e.g. BG." };
  if (!input.image) return { ok: false, error: "Add a cover image." };
  try {
    const c = await saveCategory({ ...input, name: input.name.trim(), tagline: input.tagline.trim(), codePrefix: input.codePrefix.trim().toUpperCase() });
    refresh();
    return { ok: true, id: c.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save category." };
  }
}

export async function deleteCategoryAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await deleteCategory(id);
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete category." };
  }
}
