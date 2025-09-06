import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isPluginEnabled } from "@/lib/plugins";
import {
  checkPublicPathAccess,
  createLoginRedirect,
  getSessionInEdgeRuntime,
} from "@/zap/auth/authorization";
import { checkBlogPathAccess } from "@/zap/blog/authorization";
import { logMiddlewareError } from "@/zap/errors/logger/edge";
import { checkWaitlistRedirect } from "@/zap/waitlist/authorization";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Check for waitlist redirect (optional plugin)
    if (isPluginEnabled("waitlist")) {
      const waitlistRedirect = checkWaitlistRedirect(request);
      if (waitlistRedirect) {
        return waitlistRedirect;
      }
    }

    // Check if path is a blog path (optional plugin)
    if (isPluginEnabled("blog")) {
      const blogPathAccess = checkBlogPathAccess(request);
      if (blogPathAccess) {
        return blogPathAccess;
      }
    }

    // Handle authentication if auth plugin is enabled
    if (isPluginEnabled("auth")) {
      // Check if path is publicly accessible (auth public paths)
      const publicPathAccess = checkPublicPathAccess(request);
      if (publicPathAccess) {
        return publicPathAccess;
      }

      // Fetch session from API using edge runtime compatible method
      const session = await getSessionInEdgeRuntime(request);

      if (!session) {
        // Redirect unauthenticated users to login with the original path as a query param
        return createLoginRedirect(request, pathname);
      }

      // Add session headers for authenticated requests
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-session", JSON.stringify(session));

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });

      return response;
    }

    // If auth plugin is disabled, just continue with the request
    return NextResponse.next();
  } catch (error) {
    logMiddlewareError(error);

    // On error, if auth is enabled, redirect to login
    if (isPluginEnabled("auth")) {
      return createLoginRedirect(request, request.nextUrl.pathname);
    }

    // If auth is disabled, continue with the request even on error
    return NextResponse.next();
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
