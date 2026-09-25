import { backendUrl, readUpload } from "@/lib/data/repo";

// Product photos uploaded from the admin. They live on the Render disk in
// production (fetched from the backend here, then cached by Vercel's CDN) and
// in data/uploads locally. Stored URLs stay "/uploads/…" either way.

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const NAME = /^[\w-]+\.(jpg|png|webp)$/;

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[name]">) {
  const { name } = await ctx.params;
  const match = NAME.exec(name);
  if (!match) return new Response("Not found", { status: 404 });

  let body: ArrayBuffer | Uint8Array | null = null;
  if (backendUrl) {
    const res = await fetch(`${backendUrl}/uploads/${name}`, { cache: "no-store" });
    if (res.ok) body = await res.arrayBuffer();
  } else {
    const file = await readUpload(name);
    if (file) body = new Uint8Array(file);
  }
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": TYPES[match[1]],
      // Upload names are unique, so the file behind a URL never changes
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
