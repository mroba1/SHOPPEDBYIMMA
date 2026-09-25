import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/data/store";

// Serves product photos uploaded from the admin. Swap for S3 / Cloudinary /
// Supabase Storage in production and store their URLs instead.

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[name]">) {
  const { name } = await ctx.params;
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": TYPES[path.extname(name)],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
