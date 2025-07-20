import "server-only";

import { SERVER_ENV } from "@/lib/env.server";

export const algorithm = "AES-CBC";
export const encryptionKeyHex = SERVER_ENV.ENCRYPTION_KEY;
export const ivLength = 16; // bytes

export function hexToBuffer(hex: string): ArrayBuffer {
  if (!hex || hex.length % 2 !== 0) {
    throw new Error(
      "Invalid hex string: must be non-empty and have an even length.",
    );
  }

  const bytes = new Uint8Array(
    // biome-ignore lint/style/noNonNullAssertion: it is (almost) guaranteed to be non-empty
    hex.match(/.{1,2}/g)!.map((b) => Number.parseInt(b, 16)),
  );

  return bytes.buffer;
}

export function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
