import { createDecipheriv } from "node:crypto";

import { algorithm, key } from "@/zap/lib/crypto";

export function decrypt(iv: string, encrypted: string): string {
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
