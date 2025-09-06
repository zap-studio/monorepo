import { randomBytes } from "node:crypto";

const SECRET_BYTE_LENGTH = 32;
const SECRET_BASE64_LENGTH = 43;

export function generateSecret(): string {
  return randomBytes(SECRET_BYTE_LENGTH)
    .toString("base64")
    .slice(0, SECRET_BASE64_LENGTH);
}
