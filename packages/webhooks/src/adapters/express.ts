import type { Request, Response } from "express";
import type { NormalizedRequest, NormalizedResponse } from "../types";
import type { Adapter } from "./base";

/**
 * Express adapter for the webhook router
 *
 * @example
 * ```ts
 * import express from "express";
 * import { WebhookRouter } from "@zap-studio/webhooks";
 * import { expressAdapter } from "@zap-studio/webhooks/adapters/express";
 *
 * const app = express();
 * const router = new WebhookRouter<WebhookMap>();
 *
 * // Important: Use express.raw() middleware to preserve raw body
 * app.post("/webhook/*", express.raw({ type: "application/json" }), expressAdapter.handleWebhook(router));
 * ```
 */
class ExpressAdapter implements Adapter {
  /**
   * Extract raw body from Express request
   */
  private extractRawBody(body: unknown): Buffer {
    if (Buffer.isBuffer(body)) {
      return body;
    }

    if (typeof body === "string") {
      return Buffer.from(body);
    }

    if (typeof body === "object" && body !== null) {
      // If body is already parsed JSON, stringify it back
      return Buffer.from(JSON.stringify(body));
    }

    // Fallback: empty body
    return Buffer.alloc(0);
  }

  /**
   * Convert Express headers to Web Headers API
   */
  private convertHeaders(reqHeaders: Request["headers"]): Headers {
    const headers = new Headers();

    for (const [key, value] of Object.entries(reqHeaders)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        // For multiple header values, join them with commas (HTTP spec)
        headers.set(key, value.join(", "));
      } else {
        headers.set(key, String(value));
      }
    }

    return headers;
  }

  /**
   * Parse JSON body if content-type is application/json
   */
  private parseJsonBody(body: unknown, contentType?: string): unknown {
    if (!contentType?.includes("application/json")) {
      return;
    }

    try {
      if (Buffer.isBuffer(body)) {
        return JSON.parse(body.toString());
      }

      if (typeof body === "object" && body !== null) {
        return body;
      }
    } catch {
      // If JSON parsing fails, leave json as undefined
    }

    return;
  }

  async toNormalizedRequest(req: Request): Promise<NormalizedRequest> {
    const rawBody = this.extractRawBody(req.body);
    const headers = this.convertHeaders(req.headers);
    const json = this.parseJsonBody(req.body, req.headers["content-type"]);

    return await Promise.resolve({
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
      path: req.path,
      headers,
      rawBody,
      json,
      query: req.query as Record<string, string | string[]>,
      params: req.params as Record<string, string>,
    });
  }

  /**
   * Convert a NormalizedResponse to a framework-specific response
   * @param res The Express response object
   * @param normalizedResponse The normalized response to convert
   * @returns A promise that resolves when the response is sent
   */
  async toFrameworkResponse(
    res: Response,
    normalizedResponse: NormalizedResponse
  ): Promise<Response> {
    // Set custom headers if provided
    if (normalizedResponse.headers) {
      for (const [key, value] of normalizedResponse.headers.entries()) {
        res.setHeader(key, value);
      }
    }

    // Set status code
    res.status(normalizedResponse.status);

    // Send body
    if (normalizedResponse.body !== undefined) {
      // If body is an object, send as JSON
      if (
        typeof normalizedResponse.body === "object" &&
        normalizedResponse.body !== null
      ) {
        res.json(normalizedResponse.body);
      } else {
        // Otherwise send as-is
        res.send(normalizedResponse.body);
      }
    } else {
      // No body, just end the response
      res.end();
    }

    return await Promise.resolve(res);
  }

  /**
   * Express middleware to handle incoming webhooks
   *
   * @example
   * ```ts
   * import express from "express";
   * import { WebhookRouter } from "@zap-studio/webhooks";
   * import { expressAdapter } from "@zap-studio/webhooks/adapters/express";
   *
   * const app = express();
   * const router = new WebhookRouter<WebhookMap>();
   *
   * // Important: Use express.raw() middleware to preserve raw body
   * app.post("/webhook/*", express.raw({ type: "application/json" }), expressAdapter.handleWebhook(router));
   * ```
   */
  handleWebhook(router: {
    handle(req: NormalizedRequest): Promise<NormalizedResponse>;
  }): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response) => {
      const normalizedRequest = await this.toNormalizedRequest(req);
      const normalizedResponse = await router.handle(normalizedRequest);
      await this.toFrameworkResponse(res, normalizedResponse);
    };
  }
}

/**
 * Express adapter instance for the webhook router
 */
export const expressAdapter = new ExpressAdapter();
