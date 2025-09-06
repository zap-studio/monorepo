import "server-only";

import { algorithm, bufferToHex, hexToBuffer, ivLength } from ".";

export async function encrypt(text: string, keyHex: string) {
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const keyBuffer = hexToBuffer(keyHex);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: algorithm },
    false,
    ["encrypt"]
  );

  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt(
    { name: algorithm, iv },
    cryptoKey,
    encoded
  );

  return {
    iv: bufferToHex(iv.buffer),
    encrypted: bufferToHex(encrypted),
  };
}
