/**
 * Generates a UUID v4 compliant string that works in Node.js, browser, and edge runtime
 * Uses crypto.getRandomValues when available, falls back to Math.random
 */
export function generateUuid(): string {
  // Try to use crypto.getRandomValues if available (browser, Node.js 15+, edge runtime)
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);

    // Set version (4) and variant bits according to RFC 4122
    // Version 4: set bits 12-15 of time-hi-and-version to 0100
    bytes[6] = (bytes[6] % 16) + 64; // Version 4 (0x40 = 64)
    // Variant: set bits 6-7 of clock-seq-hi-and-reserved to 10
    bytes[8] = (bytes[8] % 64) + 128; // Variant 10 (0x80 = 128)

    // Convert to hex string with hyphens
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // Fallback for environments without crypto.getRandomValues
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8; // For 'y', ensure it's 8, 9, A, or B
    return v.toString(16);
  });
}
