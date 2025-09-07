import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { $fetch } from "@/lib/fetch";

import type { Session } from "../providers/better-auth/client";
import { ZAP_AUTH_CONFIG } from "../zap.plugin.config";

/**
 * Checks if the current path is a public path that doesn't require authentication.
 *
 * @param pathname - The current pathname
 * @returns boolean indicating if the path is public
 */
export function isPublicPath(pathname: string): boolean {
  return ZAP_AUTH_CONFIG.PUBLIC_PATHS.includes(pathname);
}

/**
 * Checks if the current path should be allowed without authentication.
 * This includes public paths and any custom logic for auth bypass.
 *
 * @param request - The Next.js request object
 * @returns NextResponse to continue with the request if allowed, otherwise null
 */
export function checkPublicPathAccess(
  request: NextRequest
): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    const requestHeaders = new Headers(request.headers);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return response;
  }

  return null;
}

/**
 * Creates a redirect response to the login page with the original path as redirect parameter.
 *
 * @param request - The Next.js request object
 * @param pathname - The current pathname to redirect back to after login
 * @returns NextResponse redirect to login page
 */
export function createLoginRedirect(
  request: NextRequest,
  pathname: string
): NextResponse {
  const loginUrl = new URL(ZAP_AUTH_CONFIG.LOGIN_URL, request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Gets the login URL from the auth configuration.
 *
 * @returns string representing the login URL
 */
export function getLoginUrl(): string {
  return ZAP_AUTH_CONFIG.LOGIN_URL;
}

/**
 * Fetches the current user session from the auth API in edge runtime.
 * This method is specifically designed for use in middleware and edge functions
 * where traditional session access methods may not be available.
 *
 * @param request - The Next.js request object containing headers (including cookies)
 * @returns Promise<Session | null> - The user session if authenticated, null otherwise
 */
export async function getSessionInEdgeRuntime(
  request: NextRequest
): Promise<Session | null> {
  try {
    const session = await $fetch<Session>("/api/auth/get-session", {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    return session;
  } catch {
    // Session fetch failed, treat as unauthenticated
    return null;
  }
}
