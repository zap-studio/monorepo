import "server-only";

import { algorithm, hexToBuffer } from ".";

export async function decrypt(
  ivHex: string,
  encryptedHex: string,
  keyHex: string
) {
  const iv = new Uint8Array(hexToBuffer(ivHex));
  const encryptedBuffer = hexToBuffer(encryptedHex);
  const keyBuffer = hexToBuffer(keyHex);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: algorithm },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: algorithm, iv },
    cryptoKey,
    encryptedBuffer
  );

  return new TextDecoder().decode(decrypted);
}
