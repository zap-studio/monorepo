import type { VerifyFn } from "./types/index.js";
import { constantTimeEquals } from "./utils/index.js";

const HMAC_HASH = {
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
} as const;

type HmacAlgorithm = keyof typeof HMAC_HASH;

/**
 * Creates a webhook verifier that validates an HMAC signature from a request header.
 *
 * The verifier imports the provided string secret once, computes an HMAC from
 * `req.rawBody`, normalizes the incoming header value, and compares both
 * signatures in constant time.
 *
 * Header values like `sha256=<hex>` are supported so common provider formats
 * such as GitHub work without extra parsing.
 *
 * @example
 * ```ts
 * import { createWebhookRouter } from "@zap-studio/webhooks";
 * import { createHmacVerifier } from "@zap-studio/webhooks/verify";
 *
 * const router = createWebhookRouter({
 *   verify: createHmacVerifier({
 *     headerName: "x-hub-signature-256",
 *     secret: process.env.GITHUB_WEBHOOK_SECRET!,
 *   }),
 * });
 * ```
 *
 * @param options - Verifier configuration.
 * @param options.headerName - Header containing the provider signature.
 * @param options.secret - Shared HMAC secret as a string.
 * @param options.algo - HMAC hash algorithm. Defaults to `"sha256"`.
 * @returns A router-compatible request verifier.
 *
 * @throws {Error}
 * Thrown when Web Crypto is unavailable or the algorithm is unsupported.
 */
export function createHmacVerifier({
  headerName,
  secret,
  algo = "sha256",
}: {
  headerName: string;
  secret: string;
  algo?: HmacAlgorithm;
}): VerifyFn {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is unavailable in this runtime");
  }

  const hash = HMAC_HASH[algo];
  if (!hash) {
    throw new Error(`Unsupported HMAC algorithm: ${algo}`);
  }

  const keyPromise = subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"],
  );

  return async (req) => {
    const actual = req.headers.get(headerName);
    if (!actual) {
      throw new Error(`Missing signature header: ${headerName}`);
    }

    const key = await keyPromise;
    const signature = await subtle.sign("HMAC", key, req.rawBody as BufferSource);
    const expected = toHex(new Uint8Array(signature));

    if (!constantTimeEquals(expected, normalizeSignature(actual))) {
      throw new Error(`Invalid signature for header: ${headerName}`);
    }
  };
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeSignature(signature: string): string {
  return signature
    .replace(/^[a-z0-9-]+=/i, "")
    .trim()
    .toLowerCase();
}
