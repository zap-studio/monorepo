import { randomBytes } from 'node:crypto';

export function generateSecret() {
  return randomBytes(32).toString('base64').slice(0, 43);
}
