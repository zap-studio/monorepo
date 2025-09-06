import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ZAP_WAITLIST_CONFIG } from "../zap.plugin.config";

/**
 * Checks if the waitlist feature is enabled and if the current path should be redirected to the waitlist page.
 *
 * @param request - The Next.js request object
 * @returns NextResponse redirect to waitlist page if applicable, otherwise null
 */
export function checkWaitlistRedirect(
  request: NextRequest
): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Redirect to waitlist if feature is enabled and user is not on waitlist page
  if (ZAP_WAITLIST_CONFIG.ENABLE_WAITLIST_PAGE && pathname !== "/waitlist") {
    const waitlistUrl = new URL("/waitlist", request.url);
    return NextResponse.redirect(waitlistUrl);
  }

  return null;
}

/**
 * Checks if the waitlist feature is enabled.
 *
 * @returns boolean indicating if waitlist is enabled
 */
export function isWaitlistEnabled(): boolean {
  return ZAP_WAITLIST_CONFIG.ENABLE_WAITLIST_PAGE;
}

/**
 * Checks if the current path is the waitlist page.
 *
 * @param pathname - The current pathname
 * @returns boolean indicating if the path is the waitlist page
 */
export function isWaitlistPage(pathname: string): boolean {
  return pathname === "/waitlist";
}
