/**
 * Next.js Edge Middleware — Server-side route protection
 *
 * Runs before the page renders. Checks for a token in cookies.
 * If the user tries to access a protected route without being logged in,
 * they are immediately redirected to /signin.
 *
 * Token flow:
 *   1. User logs in → LoginForm calls apiLogin() → gets token from backend
 *   2. LoginForm writes token to cookie: document.cookie = "graphix_token=..."
 *   3. This middleware reads that cookie on every request (edge-compatible)
 *   4. Zustand store also keeps token in localStorage (graphix-store) for
 *      client-side API calls — both stay in sync via the login/logout helpers.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route categories ──────────────────────────────────────────

// Requires a valid session — redirect to /signin if no cookie
const PROTECTED_ROUTES = ["/dashboard", "/app", "/feedback"];

// Should not be accessible when already logged in — redirect to /dashboard
const AUTH_ROUTES = ["/signin", "/signup", "/login"];

// Explicitly public — never redirect these regardless of auth state
// (listed here for documentation; they simply won't match PROTECTED_ROUTES)
// const PUBLIC_ROUTES = ["/", "/about", "/policy", "/terms", "/pricing"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookie (set by LoginForm/SignupForm after successful auth)
  const token = request.cookies.get("graphix_token")?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // ── Unauthenticated → protected route: send to signin ──────
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname); // remember where they were going
    return NextResponse.redirect(url);
  }

  // ── Authenticated → auth page: send to dashboard ───────────
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// matcher must include every route the middleware needs to inspect.
// Public routes (/, /about, /policy, /terms) are intentionally excluded —
// they never match so Next.js skips running middleware on them entirely.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/app/:path*",
    "/feedback/:path*",
    "/signin",
    "/signup",
    "/login",
  ],
};
