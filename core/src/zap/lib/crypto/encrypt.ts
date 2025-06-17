import { createCipheriv, randomBytes } from "node:crypto";

import { algorithm, ivLength, key } from "@/zap/lib/crypto";

export function encrypt(text: string): { iv: string; encrypted: string } {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encrypted };
}
