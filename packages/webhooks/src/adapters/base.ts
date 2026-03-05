import type { NormalizedRequest, NormalizedResponse } from "../types";

/**
 * Minimal framework adapter contract.
 *
 * Implement this when integrating the webhook router with an HTTP framework.
 */
export interface Adapter {
  /**
   * Creates a framework handler that:
   * 1. normalizes the incoming framework request
   * 2. executes the webhook router
   * 3. writes the normalized response back to the framework response
   */
  handleWebhook<TFrameworkReq = unknown, TFrameworkRes = unknown>(router: {
    handle(req: NormalizedRequest): Promise<NormalizedResponse>;
  }): (req: TFrameworkReq, res: TFrameworkRes) => Promise<void>;

  /**
   * Maps a normalized router response to the framework response object.
   *
   * @param frameworkRes - Framework-specific response object (e.g. `res`)
   * @param res - Normalized response returned by the webhook router
   */
  toFrameworkResponse<TFrameworkRes = unknown>(
    frameworkRes: TFrameworkRes,
    res: NormalizedResponse
  ): Promise<TFrameworkRes>;

  /**
   * Maps a framework request into the normalized request contract.
   *
   * The returned object must include `rawBody` to support signature verification.
   *
   * @param req - Framework-specific request object
   */
  toNormalizedRequest<TReq = unknown>(req: TReq): Promise<NormalizedRequest>;
}

/**
 * Base adapter helper.
 *
 * Extend this class in consumers to keep framework integration boilerplate
 * in one place while relying on the package router contract.
 */
export abstract class BaseAdapter implements Adapter {
  /** @inheritdoc */
  abstract toNormalizedRequest<TReq = unknown>(
    req: TReq
  ): Promise<NormalizedRequest>;
  /** @inheritdoc */
  abstract toFrameworkResponse<TFrameworkRes = unknown>(
    frameworkRes: TFrameworkRes,
    res: NormalizedResponse
  ): Promise<TFrameworkRes>;

  /**
   * Shared adapter pipeline implementation.
   *
   * Most consumers only need to implement request/response mapping methods and
   * can reuse this default orchestration.
   */
  handleWebhook<TFrameworkReq = unknown, TFrameworkRes = unknown>(router: {
    handle(req: NormalizedRequest): Promise<NormalizedResponse>;
  }): (req: TFrameworkReq, res: TFrameworkRes) => Promise<void> {
    return async (req, res) => {
      const normalizedReq = await this.toNormalizedRequest(req);
      const normalizedRes = await router.handle(normalizedReq);
      await this.toFrameworkResponse(res, normalizedRes);
    };
  }
}
