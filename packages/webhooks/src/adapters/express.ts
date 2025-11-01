import type { Request, Response } from "express";
import type { Adapter } from "./types";

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
 * app.post("/webhook/*", express.raw({ type: "application/json" }), async (req, res) => {
 *   const normalizedRequest = await expressAdapter.toNormalizedRequest(req);
 *   const normalizedResponse = await router.handle(normalizedRequest);
 *   await expressAdapter.toFrameworkResponse(res, normalizedResponse);
 * });
 * ```
 */
export const expressAdapter: Adapter = {
  async toNormalizedRequest(req: Request) {
    // Get the raw body (should be a Buffer from express.raw() middleware)
    let rawBody: Buffer;

    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else if (typeof req.body === "string") {
      rawBody = Buffer.from(req.body);
    } else if (typeof req.body === "object" && req.body !== null) {
      // If body is already parsed JSON, stringify it back
      rawBody = Buffer.from(JSON.stringify(req.body));
    } else {
      // Fallback: empty body
      rawBody = Buffer.alloc(0);
    }

    // Convert Express headers to Web Headers API
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // For multiple header values, join them with commas (HTTP spec)
          headers.set(key, value.join(", "));
        } else {
          headers.set(key, String(value));
        }
      }
    }

    // Parse JSON if content-type is application/json
    let json: unknown;
    const contentType = req.headers["content-type"];
    if (contentType?.includes("application/json")) {
      try {
        if (Buffer.isBuffer(req.body)) {
          json = JSON.parse(req.body.toString());
        } else if (typeof req.body === "object" && req.body !== null) {
          json = req.body;
        }
      } catch {
        // If JSON parsing fails, leave json as undefined
      }
    }

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
      path: req.path,
      headers,
      rawBody,
      json,
      query: req.query as Record<string, string | string[]>,
      params: req.params as Record<string, string>,
    };
  },

  async toFrameworkResponse(res: Response, normalizedResponse) {
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

    return res;
  },
};
