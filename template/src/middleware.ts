import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isPluginEnabled } from "@/lib/plugins";
import {
  checkPublicPathAccess,
  createLoginRedirect,
  getSessionInEdgeRuntime,
} from "@/zap/auth/authorization";

import { logMiddlewareError } from "@/zap/errors/logger/edge";
import { checkWaitlistRedirect } from "@/zap/waitlist/authorization";
import { getServerPlugin } from "./lib/zap.server";

const handleWaitlist = (request: NextRequest) => {
  if (!isPluginEnabled("waitlist")) {
    return;
  }
  return checkWaitlistRedirect(request);
};

const handleBlogAccess = (request: NextRequest) => {
  const blogPlugin = getServerPlugin("blog");
  const blogConfig = blogPlugin?.config ?? {};
  const check = blogPlugin?.middleware?.checkBlogPathAccess;
  if (!check) {
    return;
  }
  return check(request, { blog: blogConfig });
};

const handleAuth = async (request: NextRequest) => {
  const authPlugin = getServerPlugin("auth");
  const authConfig = authPlugin?.config ?? {};
  if (!authPlugin?.config) {
    return;
  }

  const publicPathAccess = checkPublicPathAccess(request, { auth: authConfig });
  if (publicPathAccess) {
    return publicPathAccess;
  }

  const session = await getSessionInEdgeRuntime(request);
  if (!session) {
    return createLoginRedirect(request, request.nextUrl.pathname, {
      auth: authConfig,
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-session", JSON.stringify(session));

  return NextResponse.next({ request: { headers: requestHeaders } });
};

const handleError = (request: NextRequest) => {
  const authPlugin = getServerPlugin("auth");
  const authConfig = authPlugin?.config ?? {};
  if (authPlugin?.config) {
    return createLoginRedirect(request, request.nextUrl.pathname, {
      auth: authConfig,
    });
  }
  return NextResponse.next();
};

export async function middleware(request: NextRequest) {
  try {
    const waitlistRedirect = handleWaitlist(request);
    if (waitlistRedirect) {
      return waitlistRedirect;
    }

    const blogPathAccess = handleBlogAccess(request);
    if (blogPathAccess) {
      return blogPathAccess;
    }

    const authResponse = await handleAuth(request);
    if (authResponse) {
      return authResponse;
    }

    return NextResponse.next();
  } catch (error) {
    logMiddlewareError(error);
    return handleError(request);
  }
}

export const config = {
  runtime: "nodejs", // Node.js is necessary for some plugins' middleware in the way they are currently implemented and loaded
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
