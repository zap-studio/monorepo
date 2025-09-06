import "server-only";

import { SERVER_ENV } from "@/zap/env/server";

export const algorithm = "AES-CBC";
export const encryptionKeyHex = SERVER_ENV.ENCRYPTION_KEY;
export const ivLength = 16; // bytes

export function hexToBuffer(hex: string): ArrayBuffer {
  if (!hex || hex.length % 2 !== 0) {
    throw new TypeError(
      "Invalid hex string: must be non-empty and have an even length."
    );
  }

  const bytes = new Uint8Array(
    (hex.match(/.{1,2}/g) ?? []).map((b) => Number.parseInt(b, 16))
  );

  return bytes.buffer;
}

export const HEX_BYTE_LENGTH = 2;
export const HEX_RADIX = 16;

export function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(HEX_RADIX).padStart(HEX_BYTE_LENGTH, "0"))
    .join("");
}
