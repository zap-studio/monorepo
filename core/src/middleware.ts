import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { $fetch } from "@/lib/fetch";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import type { Session } from "@/zap/lib/auth/client";

const LOGIN_URL = ZAP_DEFAULT_SETTINGS.AUTH.LOGIN_URL;

// Helper function to build CSP header
function buildCSPHeader(nonce: string): string {
  const { CSP } = ZAP_DEFAULT_SETTINGS.SECURITY;

  const directives = [
    `default-src ${CSP.DEFAULT_SRC.join(" ")}`,
    `script-src ${CSP.SCRIPT_SRC.join(" ")} 'nonce-${nonce}'`,
    `style-src ${CSP.STYLE_SRC.join(" ")} 'nonce-${nonce}'`,
    `img-src ${CSP.IMG_SRC.join(" ")}`,
    `font-src ${CSP.FONT_SRC.join(" ")}`,
    `object-src ${CSP.OBJECT_SRC.join(" ")}`,
    `base-uri ${CSP.BASE_URI.join(" ")}`,
    `form-action ${CSP.FORM_ACTION.join(" ")}`,
    `frame-ancestors ${CSP.FRAME_ANCESTORS.join(" ")}`,
  ];

  if (CSP.UPGRADE_INSECURE_REQUESTS) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Generate CSP nonce and headers
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const cspHeader = buildCSPHeader(nonce);

    // Allow public paths
    if (
      ZAP_DEFAULT_SETTINGS.AUTH.PUBLIC_PATHS.includes(pathname) ||
      pathname.startsWith(ZAP_DEFAULT_SETTINGS.BLOG.BASE_PATH)
    ) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-nonce", nonce);
      requestHeaders.set("Content-Security-Policy", cspHeader);

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      response.headers.set("Content-Security-Policy", cspHeader);
      return response;
    }

    // Fetch session from API
    let session: Session | null = null;
    try {
      session = await $fetch<Session>("/api/auth/get-session", {
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
      const loginUrl = new URL(LOGIN_URL, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check mail verification
    if (
      ZAP_DEFAULT_SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION &&
      (!session.user || !session.user.emailVerified)
    ) {
      const verifyUrl = new URL(LOGIN_URL, request.url);
      verifyUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(verifyUrl);
    }

    // Add session and security headers for authenticated requests
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-session", JSON.stringify(session));
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", cspHeader);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("Content-Security-Policy", cspHeader);

    return response;
  } catch {
    // Fallback: redirect to login on any unexpected error
    const loginUrl = new URL(LOGIN_URL, request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
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
       */
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|sitemap-0.xml|robots.txt|sw.js|manifest.json|manifest.webmanifest|icon-192x192.png|icon-512x512.png|apple-touch-icon.png|badge.png|favicon-16x16.png|favicon-32x32.png|og.png|_vercel/.*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
