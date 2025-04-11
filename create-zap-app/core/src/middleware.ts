import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./zap/lib/auth-server";

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
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith(blogPublicBasePath)
  ) {
    return NextResponse.next();
  }

  // Check session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    // Redirect unauthenticated users to /login with the original path as a query param
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check email verification
  if (!session.user.emailVerified) {
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
     * - manifest.json, manifest.ts (PWA manifest files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw.js|manifest.json|manifest.ts).*)",
  ],
};
