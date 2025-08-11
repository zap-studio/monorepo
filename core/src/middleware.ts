import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  checkPublicPathAccess,
  createLoginRedirect,
  getSessionInEdgeRuntime,
} from "@/zap/auth/authorization";
import { logError } from "@/zap/errors/logger";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Check for waitlist redirect (optional plugin)
    try {
      const { checkWaitlistRedirect } = await import(
        "@/zap/waitlist/authorization"
      );
      const waitlistRedirect = checkWaitlistRedirect(request);
      if (waitlistRedirect) {
        return waitlistRedirect;
      }
    } catch {
      // Waitlist plugin not installed, skip check
    }

    // Check if path is publicly accessible (auth public paths)
    const publicPathAccess = checkPublicPathAccess(request);
    if (publicPathAccess) {
      return publicPathAccess;
    }

    // Check if path is a blog path (optional plugin)
    try {
      const { checkBlogPathAccess } = await import("@/zap/blog/authorization");
      const blogPathAccess = checkBlogPathAccess(request);
      if (blogPathAccess) {
        return blogPathAccess;
      }
    } catch {
      // Blog plugin not installed, skip check
    }

    // Fetch session from API using edge runtime compatible method
    const session = await getSessionInEdgeRuntime(request);

    if (!session) {
      // Redirect unauthenticated users to login with the original path as a query param
      return createLoginRedirect(request, pathname);
    }

    // Add session and security headers for authenticated requests
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-session", JSON.stringify(session));

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    return response;
  } catch (error) {
    // Fallback: redirect to login on any unexpected error
    logError(error);
    return createLoginRedirect(request, request.nextUrl.pathname);
  }
}

export const config = {
  matcher: [
    {
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
       * - opengraph-image (OpenGraph image route)
       */
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|sitemap-0.xml|robots.txt|sw.js|manifest.json|manifest.webmanifest|icon-192x192.png|icon-512x512.png|apple-touch-icon.png|badge.png|favicon-16x16.png|favicon-32x32.png|og.png|opengraph-image.*|_vercel/.*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
