import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "@/zap/lib/auth/client";
import { $fetch } from "@/lib/fetch";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
  "/_vercel/speed-insights/vitals",
  "/_vercel/insights/view",
];
const blogPublicBasePath = "/blog";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (
      publicPaths.includes(pathname) ||
      pathname.startsWith(blogPublicBasePath)
    ) {
      return NextResponse.next();
    }

    // Fetch session from API
    let session: Session | null = null;
    try {
      session = await $fetch<Session>(`/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
    } catch {
      // Session fetch failed, treat as unauthenticated
      session = null;
    }

    if (!session) {
      // Redirect unauthenticated users to /login with the original path as a query param
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check email verification
    if (!session.user || !session.user.emailVerified) {
      const verifyUrl = new URL("/login", request.url);
      verifyUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(verifyUrl);
    }

    // Add session to headers for server-side use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-session", JSON.stringify(session));

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    // Fallback: redirect to login on any unexpected error
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - sw.js (service worker)
     * - manifest.json, manifest.ts, manifest.webmanifest (PWA manifest files)
     * - icon-192x192.png, icon-512x512.png (PWA icons)
     * - /_vercel/.* (Vercel specific files)
     * - badge.png, favicon-16x16.png, favicon-32x32.png (favicon files)
     * - og.png (Open Graph image)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|sitemap-0.xml|robots.txt|sw.js|manifest.json|manifest.webmanifest|icon-192x192.png|icon-512x512.png|apple-touch-icon.png|badge.png|favicon-16x16.png|favicon-32x32.png|og.png|_vercel/.*).*)",
  ],
};
