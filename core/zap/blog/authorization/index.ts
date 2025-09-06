import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ZAP_BLOG_CONFIG } from "../zap.plugin.config";

/**
 * Checks if the current path is a blog path that should be publicly accessible.
 *
 * @param pathname - The current pathname
 * @returns boolean indicating if the path is a blog path
 */
export function isBlogPath(pathname: string): boolean {
  return pathname.startsWith(ZAP_BLOG_CONFIG.BASE_PATH);
}

/**
 * Checks if the current path should be allowed as a blog path without authentication.
 * Blog paths are typically public and don't require authentication.
 *
 * @param request - The Next.js request object
 * @returns NextResponse to continue with the request if it's a blog path, otherwise null
 */
export function checkBlogPathAccess(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (isBlogPath(pathname)) {
    const requestHeaders = new Headers(request.headers);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return response;
  }

  return null;
}

/**
 * Gets the blog base path from the blog configuration.
 *
 * @returns string representing the blog base path
 */
export function getBlogBasePath(): string {
  return ZAP_BLOG_CONFIG.BASE_PATH;
}

/**
 * Gets the blog data directory from the blog configuration.
 *
 * @returns string representing the blog data directory
 */
export function getBlogDataDir(): string {
  return ZAP_BLOG_CONFIG.DATA_DIR;
}
