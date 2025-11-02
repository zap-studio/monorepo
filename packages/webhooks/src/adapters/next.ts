import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { NormalizedRequest, NormalizedResponse } from "../types";

/**
 * Next.js App Router adapter for the webhook router
 *
 * @example
 * ```ts
 * // app/api/webhook/[...path]/route.ts
 * import { WebhookRouter } from "@zap-studio/webhooks";
 * import { nextjsAdapter } from "@zap-studio/webhooks/adapters/nextjs";
 *
 * const router = new WebhookRouter<WebhookMap>();
 *
 * export const POST = nextjsAdapter.handleWebhook(router);
 * ```
 */
class NextAdapter {
  /**
   * Extract raw body from Next.js request
   */
  private async extractRawBody(req: NextRequest): Promise<Buffer> {
    try {
      const arrayBuffer = await req.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      // If reading body fails, return empty buffer
      return Buffer.alloc(0);
    }
  }

  /**
   * Convert Next.js headers to Web Headers API
   */
  private convertHeaders(reqHeaders: Headers): Headers {
    // NextRequest.headers is already a Headers object, so we can clone it
    return new Headers(reqHeaders);
  }

  /**
   * Parse JSON body if content-type is application/json
   */
  private parseJsonBody(body: Buffer, contentType?: string | null): unknown {
    if (!contentType?.includes("application/json")) {
      return;
    }

    try {
      if (body.length > 0) {
        return JSON.parse(body.toString());
      }
    } catch {
      // If JSON parsing fails, leave json as undefined
    }

    return;
  }

  /**
   * Extract route parameters from Next.js dynamic route
   * Supports catch-all routes like [...path]
   */
  private extractParams(context?: {
    params: Record<string, string | string[]>;
  }): Record<string, string> {
    const params: Record<string, string> = {};

    if (context?.params) {
      for (const [key, value] of Object.entries(context.params)) {
        if (Array.isArray(value)) {
          // For catch-all routes, join with /
          params[key] = value.join("/");
        } else {
          params[key] = value;
        }
      }
    }

    return params;
  }

  /**
   * Extract query parameters from Next.js request
   */
  private extractQuery(req: NextRequest): Record<string, string | string[]> {
    const query: Record<string, string | string[]> = {};
    const { searchParams } = req.nextUrl;

    for (const [key, value] of searchParams.entries()) {
      const existing = query[key];
      if (existing) {
        // Multiple values for the same key
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          query[key] = [existing, value];
        }
      } else {
        query[key] = value;
      }
    }

    return query;
  }

  /**
   * Extract path from Next.js request
   */
  private extractPath(req: NextRequest): string {
    return req.nextUrl.pathname;
  }

  async toNormalizedRequest(
    req: NextRequest,
    context?: { params: Record<string, string | string[]> }
  ): Promise<NormalizedRequest> {
    const rawBody = await this.extractRawBody(req);
    const headers = this.convertHeaders(req.headers);
    const contentType = req.headers.get("content-type");
    const json = this.parseJsonBody(rawBody, contentType);

    return {
      method: req.method as
        | "GET"
        | "HEAD"
        | "POST"
        | "PUT"
        | "DELETE"
        | "CONNECT"
        | "OPTIONS"
        | "TRACE"
        | "PATCH",
      path: this.extractPath(req),
      headers,
      rawBody,
      json,
      query: this.extractQuery(req),
      params: this.extractParams(context),
    };
  }

  /**
   * Convert a NormalizedResponse to Next.js Response
   * @param normalizedResponse The normalized response to convert
   * @returns A Next.js Response object
   */
  toFrameworkResponse(normalizedResponse: NormalizedResponse): NextResponse {
    const headers = new Headers();

    // Copy custom headers if provided
    if (normalizedResponse.headers) {
      for (const [key, value] of normalizedResponse.headers.entries()) {
        headers.set(key, value);
      }
    }

    return NextResponse.json(normalizedResponse.body ?? null, {
      status: normalizedResponse.status,
      headers,
    });
  }

  /**
   * Next.js App Router route handler to handle incoming webhooks
   *
   * @example
   * ```ts
   * // app/api/webhook/[...path]/route.ts
   * import { WebhookRouter } from "@zap-studio/webhooks";
   * import { nextjsAdapter } from "@zap-studio/webhooks/adapters/nextjs";
   *
   * const router = new WebhookRouter<WebhookMap>();
   *
   * export const POST = nextjsAdapter.handleWebhook(router);
   * ```
   *
   * @example With dynamic route parameters
   * ```ts
   * // app/api/webhook/[event]/route.ts
   * import { WebhookRouter } from "@zap-studio/webhooks";
   * import { nextjsAdapter } from "@zap-studio/webhooks/adapters/nextjs";
   *
   * const router = new WebhookRouter<WebhookMap>();
   *
   * export const POST = nextjsAdapter.handleWebhook(router);
   * ```
   */
  handleWebhook(router: {
    handle(req: NormalizedRequest): Promise<NormalizedResponse>;
  }): (
    req: NextRequest,
    context: { params: Record<string, string | string[]> }
  ) => Promise<NextResponse> {
    return async (
      req: NextRequest,
      context: { params: Record<string, string | string[]> }
    ) => {
      const normalizedRequest = await this.toNormalizedRequest(req, context);
      const normalizedResponse = await router.handle(normalizedRequest);
      return this.toFrameworkResponse(normalizedResponse);
    };
  }
}

/**
 * Next.js App Router adapter instance for the webhook router
 */
export const nextAdapter = new NextAdapter();
