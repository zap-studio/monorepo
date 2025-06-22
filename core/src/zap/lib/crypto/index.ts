import { requireEnv } from "@/lib/env";

const ENCRYPTION_KEY = requireEnv("ENCRYPTION_KEY");

export const algorithm = "AES-CBC";
export const encryptionKeyHex = ENCRYPTION_KEY;
export const ivLength = 16; // bytes

export function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)),
  );
  return bytes.buffer;
}

export function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
