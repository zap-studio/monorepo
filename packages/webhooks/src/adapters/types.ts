import type { NormalizedRequest, NormalizedResponse } from "../types";

/** Adapter interface for framework-specific request/response handling */
export type Adapter = {
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
  // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here because it depends on the framework
  toNormalizedRequest(req: any): Promise<NormalizedRequest>;

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
  // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here because it depends on the framework
  toFrameworkResponse(frameworkRes: any, res: NormalizedResponse): Promise<any>;
};
