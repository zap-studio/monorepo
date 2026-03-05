import type { BinaryLike, KeyObject } from "node:crypto";
import type { VerifyFn } from "./types";
import { constantTimeEquals } from "./utils";

const SIGNATURE_REGEX = /^sha256=/;

/**
 * Creates an HMAC-based request verification function.
 *
 * The returned verifier reads the configured signature header, computes the
 * expected HMAC from `req.rawBody`, and compares them in constant time.
 *
 * @note Uses Node.js `crypto` at runtime.
 *
 * @example
 * ```ts
 * import { createWebhookRouter } from "@zap-studio/webhooks";
 * import { createHmacVerifier } from "@zap-studio/webhooks/verify";
 * import { z } from "zod";
 *
 * const router = createWebhookRouter({
 *   verify: createHmacVerifier({
 *     headerName: "x-hub-signature-256",
 *     secret: process.env.GITHUB_WEBHOOK_SECRET!,
 *   }),
 * });
 *
 * router.register("github/push", {
 *   schema: z.object({ ref: z.string() }),
 *   handler: async ({ ack }) => ack(),
 * });
 * ```
 *
 * @param options - HMAC verifier options.
 * @param options.headerName - Header containing provider signature.
 * @param options.secret - HMAC secret key.
 * @param options.algo - Hash algorithm used for HMAC generation.
 * @returns A verifier function compatible with router `verify`.
 */
export function createHmacVerifier({
  headerName,
  secret,
  algo = "sha256",
}: {
  headerName: string;
  secret: BinaryLike | KeyObject;
  algo?: string;
}): VerifyFn {
  return async (req) => {
    const sig = req.headers.get(headerName.toLowerCase()) || "";
    if (!sig) {
      throw Object.assign(new Error("missing signature"), {
        name: "SignatureError",
      });
    }

    // compute HMAC of rawBody (it uses Node.js crypto module, so it works only in Node.js environment)
    const crypto = await import("node:crypto");
    const expected = crypto
      .createHmac(algo, secret)
      .update(req.rawBody)
      .digest("hex");

    if (!constantTimeEquals(expected, sig.replace(SIGNATURE_REGEX, ""))) {
      throw Object.assign(new Error("invalid signature"), {
        name: "SignatureError",
      });
    }
  };
}
