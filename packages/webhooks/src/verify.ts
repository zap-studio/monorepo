import type { BinaryLike, KeyObject } from "node:crypto";
import type { VerifyFn } from "./types";
import { constantTimeEquals } from "./utils";

const SIGNATURE_REGEX = /^sha256=/;

/**
 * A factory function to create an HMAC verifier for incoming requests.
 *
 * @note This function uses Node.js's built-in `crypto` module to compute the HMAC.
 *
 * @example
 * ```ts
 * import { createHmacVerifier } from "./verify";
 *
 * const verify = createHmacVerifier({
 *   headerName: "X-Hub-Signature-256",
 *   secret: "your-secret",
 * });
 *
 * // then use the `verify` function in your WebhookRouter
 * const router = new WebhookRouter<MyWebhookMap>({
 *   verify,
 * });
 * ```
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
