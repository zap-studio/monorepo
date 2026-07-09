/**
 * Framework adapter contracts for webhook router integration.
 *
 * @module @zap-studio/webhooks/adapters/base
 */

import type { NormalizedRequest, NormalizedResponse } from "../types/index.js";

interface RouterHandler {
  handle: (req: NormalizedRequest) => Promise<NormalizedResponse>;
}

/**
 * Minimal framework adapter contract.
 *
 * Implement this when integrating the webhook router with an HTTP framework.
 *
 * @template TReq - Framework-specific request type (e.g. `express.Request`).
 * @template TRes - Framework-specific response type (e.g. `express.Response`).
 */
export interface Adapter<TReq = unknown, TRes = unknown> {
  /**
   * Creates a framework handler that:
   * 1. normalizes the incoming framework request
   * 2. executes the webhook router
   * 3. writes the normalized response back to the framework response
   */
  handleWebhook: (
    router: RouterHandler
  ) => (req: TReq, res: TRes) => Promise<void>;

  /**
   * Maps a normalized router response to the framework response object.
   *
   * @param frameworkRes - Framework-specific response object (e.g. `res`)
   * @param res - Normalized response returned by the webhook router
   */
  toFrameworkResponse: (
    frameworkRes: TRes,
    res: NormalizedResponse
  ) => Promise<TRes>;

  /**
   * Maps a framework request into the normalized request contract.
   *
   * The returned object must include `rawBody` to support signature verification.
   *
   * @param req - Framework-specific request object
   */
  toNormalizedRequest: (req: TReq) => Promise<NormalizedRequest>;
}

/**
 * Base adapter helper.
 *
 * Extend this class in consumers to keep framework integration boilerplate
 * in one place while relying on the package router contract.
 */
export abstract class BaseAdapter<
  TReq = unknown,
  TRes = unknown,
> implements Adapter<TReq, TRes> {
  /** @inheritdoc */
  abstract toNormalizedRequest: (req: TReq) => Promise<NormalizedRequest>;
  /** @inheritdoc */
  abstract toFrameworkResponse: (
    frameworkRes: TRes,
    res: NormalizedResponse
  ) => Promise<TRes>;

  /**
   * Shared adapter pipeline implementation.
   *
   * Most consumers only need to implement request/response mapping methods and
   * can reuse this default orchestration.
   */
  handleWebhook =
    (router: RouterHandler): ((req: TReq, res: TRes) => Promise<void>) =>
    async (req, res) => {
      const normalizedReq = await this.toNormalizedRequest(req);
      const normalizedRes = await router.handle(normalizedReq);
      await this.toFrameworkResponse(res, normalizedRes);
    };
}
