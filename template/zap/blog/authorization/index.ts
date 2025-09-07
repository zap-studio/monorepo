import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerPlugin } from "@/lib/zap.server";

const blog = getServerPlugin("blog");

/**
 * Checks if the current path is a blog path that should be publicly accessible.
 *
 * @param pathname - The current pathname
 * @returns boolean indicating if the path is a blog path
 */
export function isBlogPath(pathname: string): boolean {
  return pathname.startsWith(blog.config?.BASE_PATH ?? "/blog");
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
