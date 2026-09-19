import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, sessionCookieName, isStaffRole } from "@/lib/auth";

/**
 * Route protection (Next 16 "proxy", formerly middleware):
 *  - /admin/** requires a staff session (superadmin or admin).
 *  - /account requires any logged-in user.
 *
 * Demo mode (no AUTH_SECRET): verification returns null, so /admin and
 * /account redirect to /login — the admin panel UI explains that
 * MONGODB_URI + AUTH_SECRET are required to use it.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(sessionCookieName())?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isStaffRole(session.role)) {
      // Clients don't get the panel — send them to their account page.
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  if (pathname === "/account" && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account"],
};
