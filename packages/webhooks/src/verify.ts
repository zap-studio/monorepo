import type { VerifyFn } from "./types/index.js";
import { constantTimeEquals } from "./utils/index.js";

const ALGORITHM_NAME_MAP = {
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
} as const;

type SupportedHmacAlgorithm = keyof typeof ALGORITHM_NAME_MAP;
type PortableSecret = string | BufferSource | CryptoKey;

/**
 * Creates an HMAC-based request verification function.
 *
 * The returned verifier reads the configured signature header, computes the
 * expected HMAC from `req.rawBody`, and compares them in constant time.
 *
 * @note Requires a runtime with Web Crypto support (`globalThis.crypto.subtle`).
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
  secret: PortableSecret;
  algo?: string;
}): VerifyFn {
  const normalizedAlgorithm = normalizeAlgorithm(algo);

  return async (req) => {
    const sig = req.headers.get(headerName.toLowerCase()) || "";
    if (!sig) {
      throw Object.assign(new Error("missing signature"), {
        name: "SignatureError",
      });
    }

    const expected = await createHmacHex(req.rawBody, secret, normalizedAlgorithm);
    const actual = normalizeSignature(sig);

    if (!constantTimeEquals(expected, actual)) {
      throw Object.assign(new Error("invalid signature"), {
        name: "SignatureError",
      });
    }
  };
}

function normalizeAlgorithm(algo: string): SupportedHmacAlgorithm {
  const normalized = algo.toLowerCase().replaceAll("-", "") as SupportedHmacAlgorithm;

  if (normalized in ALGORITHM_NAME_MAP) {
    return normalized;
  }

  throw new Error(`Unsupported HMAC algorithm: ${algo}`);
}

async function createHmacHex(
  payload: Uint8Array<ArrayBufferLike>,
  secret: PortableSecret,
  algo: SupportedHmacAlgorithm,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is unavailable in this runtime");
  }

  const key = await toCryptoKey(secret, algo, subtle);
  const signature = await subtle.sign("HMAC", key, toWebCryptoBytes(payload));

  return bytesToHex(new Uint8Array(signature));
}

async function toCryptoKey(
  secret: PortableSecret,
  algo: SupportedHmacAlgorithm,
  subtle: SubtleCrypto,
): Promise<CryptoKey> {
  if (isCryptoKey(secret)) {
    return secret;
  }

  return subtle.importKey(
    "raw",
    toWebCryptoBytes(secret),
    {
      name: "HMAC",
      hash: ALGORITHM_NAME_MAP[algo],
    },
    false,
    ["sign"],
  );
}

function isCryptoKey(value: PortableSecret): value is CryptoKey {
  return typeof CryptoKey !== "undefined" && value instanceof CryptoKey;
}

function toUint8Array(input: string | BufferSource | Uint8Array<ArrayBufferLike>): Uint8Array {
  if (typeof input === "string") {
    return new TextEncoder().encode(input);
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
}

function toWebCryptoBytes(
  input: string | BufferSource | Uint8Array<ArrayBufferLike>,
): Uint8Array<ArrayBuffer> {
  const bytes = toUint8Array(input);

  if (bytes.buffer instanceof ArrayBuffer) {
    return new Uint8Array(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    );
  }

  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeSignature(signature: string): string {
  return signature
    .replace(/^[a-z0-9-]+=/i, "")
    .trim()
    .toLowerCase();
}
