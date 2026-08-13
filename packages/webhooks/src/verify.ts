/**
 * Signature verification helpers for webhook requests.
 *
 * @module @zap-studio/webhooks/verify
 */

import { VerificationError } from "./errors.js";
import type { VerifyFn } from "./types.js";

/**
 * Compares two strings in constant time to prevent timing attacks.
 */
const constantTimeEquals = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    // oxlint-disable-next-line no-bitwise, unicorn/prefer-code-point -- XOR is the constant-time compare trick; charCodeAt reads each char with the same cost, and inputs are plain ASCII hex.
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

const HMAC_HASH = {
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
} as const;

type HmacAlgorithm = keyof typeof HMAC_HASH;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const normalizeSignature = (signature: string): string =>
  signature
    .replace(/^[a-z0-9-]+=/iu, "")
    .trim()
    .toLowerCase();

/**
 * Creates a webhook verifier that validates an HMAC signature from a request header.
 *
 * The verifier imports the provided string secret once, computes an HMAC from
 * `ctx.rawBody`, normalizes the incoming header value, and compares both
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
 * @throws {VerificationError}
 * Thrown when verifier setup fails or request verification does not pass.
 */
export const createHmacVerifier = ({
  headerName,
  secret,
  algo = "sha256",
}: {
  headerName: string;
  secret: string;
  algo?: HmacAlgorithm;
}): VerifyFn => {
  if (globalThis.crypto?.subtle === undefined) {
    throw new VerificationError(
      "Web Crypto API is unavailable in this runtime"
    );
  }

  const { subtle } = globalThis.crypto;

  const hash = HMAC_HASH[algo];
  if (!hash) {
    throw new VerificationError(`Unsupported HMAC algorithm: ${algo}`);
  }

  const keyPromise = subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash, name: "HMAC" },
    false,
    ["sign"]
  );

  return async (ctx) => {
    const actual = ctx.request.headers.get(headerName);
    if (actual === null || actual.length === 0) {
      throw new VerificationError(`Missing signature header: ${headerName}`);
    }

    const key = await keyPromise;
    const signature = await subtle.sign(
      "HMAC",
      key,
      new Uint8Array(ctx.rawBody)
    );
    const expected = toHex(new Uint8Array(signature));

    if (!constantTimeEquals(expected, normalizeSignature(actual))) {
      throw new VerificationError(
        `Invalid signature for header: ${headerName}`
      );
    }
  };
};
