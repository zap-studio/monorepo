import type { NormalizedRequest, NormalizedResponse } from "../types";

/** Adapter interface for framework-specific request/response handling */
export interface Adapter {
  /**
   * Create a framework-specific route handler for the webhook router
   *
   * @example
   * ```ts
   * import express from "express";
   *
   * const app = express();
   * const router = new WebhookRouter<WebhookMap>();
   *
   * app.post("/webhook/*", express.raw({ type: "application/json" }), adapter.handleWebhook(router));
   * ```
   */
  handleWebhook<TFrameworkReq = unknown, TFrameworkRes = unknown>(router: {
    handle(req: NormalizedRequest): Promise<NormalizedResponse>;
  }): (req: TFrameworkReq, res: TFrameworkRes) => Promise<void>;

  /**
   * Convert NormalizedResponse to the framework response
   *
   * @example
   * ```ts
   * const expressRes = await adapter.toFrameworkResponse(
   *   res,
   *   {
   *     status: 200,
   *     body: { success: true },
   *     headers: { "Content-Type": "application/json" },
   *   }
   * );
   * ```
   */
  toFrameworkResponse<TFrameworkRes = unknown>(
    frameworkRes: TFrameworkRes,
    res: NormalizedResponse
  ): Promise<TFrameworkRes>;
  /** Convert framework request to the NormalizedRequest (must include raw body)
   * @example
   * ```ts
   * const req = {
   *   body: { foo: "bar" },
   *   headers: { "Content-Type": "application/json" },
   * };
   * const normalizedReq = await adapter.toNormalizedRequest(req);
   * ```
   */
  toNormalizedRequest<TReq = unknown>(req: TReq): Promise<NormalizedRequest>;
}
