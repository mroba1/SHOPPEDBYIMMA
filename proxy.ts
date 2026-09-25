import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, ADMIN_DEVICE_COOKIE, adminPath, readToken } from "@/lib/session";

// First line of defence for the admin area:
//   /<ADMIN_PATH>                  → admin login (the only way to reach it)
//   /<ADMIN_PATH>/forgot-password  → password reset
//   /admin/login, /admin/forgot-*  → 404 when visited directly
//   /admin/*                       → needs a valid signed session cookie
//
// The hidden URL is only a convenience. Real protection is the session check
// here AND in every admin layout and server action (lib/auth.ts), which also
// re-checks the account in the database.

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = `/${adminPath()}`;

  if (pathname === secret || pathname === `${secret}/`) return privateRewrite(req, "/admin/login");
  if (pathname === `${secret}/forgot-password`) return privateRewrite(req, "/admin/forgot-password");

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/forgot-password")) return notFound(req);

    const session = readToken(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (!session) {
      // Only browsers that have signed in before learn where the login page is
      if (req.cookies.get(ADMIN_DEVICE_COOKIE)) {
        const url = new URL(secret, req.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
      return notFound(req);
    }
    return noIndex(NextResponse.next());
  }

  return NextResponse.next();
}

function privateRewrite(req: NextRequest, to: string) {
  const url = req.nextUrl.clone();
  url.pathname = to;
  return noIndex(NextResponse.rewrite(url));
}

function notFound(req: NextRequest) {
  return NextResponse.rewrite(new URL("/__not-found", req.url));
}

function noIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  // Everything except static assets; the admin path is configurable so it can't be listed here.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|css|js)$).*)"],
};
