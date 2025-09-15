const UUID_BYTE_LENGTH = 16 as const; // 128 bits / 16 bytes
const UUID_VERSION = 4 as const; // RFC 4122 version
const VERSION_BYTE_INDEX = 6 as const; // position of time_hi_and_version high nibble
const VARIANT_BYTE_INDEX = 8 as const; // position of clock_seq_hi_and_reserved
const NIBBLE_MOD = 16 as const; // constrain to 0-15 range
const VARIANT_MOD = 64 as const; // constrain to 0-63 range for variant arithmetic
const VARIANT_BASE = 128 as const; // 0b1000_0000 to set the leading 10 bits via arithmetic
const VARIANT_FALLBACK_OFFSET = 8 as const; // produces 8,9,10,11 (8..B) for 'y'
const VARIANT_FALLBACK_MOD = 4 as const; // size of variant selection set
const HEX_RADIX = 16 as const;
const UUID_TIME_LOW_LENGTH = 8 as const;
const UUID_TIME_MID_LENGTH = 4 as const;
const UUID_TIME_HI_LENGTH = 4 as const;
const UUID_CLOCK_SEQ_LENGTH = 4 as const;
const UUID_NODE_LENGTH = 12 as const;
const UUID_SECTION_LENGTHS = [
  UUID_TIME_LOW_LENGTH,
  UUID_TIME_MID_LENGTH,
  UUID_TIME_HI_LENGTH,
  UUID_CLOCK_SEQ_LENGTH,
  UUID_NODE_LENGTH,
] as const; // standard 8-4-4-4-12

/**
 * Generates a UUID v4 compliant string that works in Node.js, browser, and edge runtime
 * Uses crypto.getRandomValues when available, falls back to Math.random
 */
export function generateUuid(): string {
  // Try to use crypto.getRandomValues if available (browser, Node.js 15+, edge runtime)
  if (globalThis?.crypto?.getRandomValues) {
    const bytes = new Uint8Array(UUID_BYTE_LENGTH);
    globalThis.crypto.getRandomValues(bytes);

    // Set version (high nibble) and variant via arithmetic (no bitwise per lint rules)
    bytes[VERSION_BYTE_INDEX] =
      (bytes[VERSION_BYTE_INDEX] % NIBBLE_MOD) + UUID_VERSION * NIBBLE_MOD; // ensures 0x40-0x4f
    bytes[VARIANT_BYTE_INDEX] =
      (bytes[VARIANT_BYTE_INDEX] % VARIANT_MOD) + VARIANT_BASE; // ensures 0x80-0xbf

    // Convert to hex and insert hyphens according to section lengths
    const hex = Array.from(bytes, (b) =>
      b.toString(HEX_RADIX).padStart(2, "0")
    ).join("");
    let offset = 0;
    const sections: string[] = [];
    for (const len of UUID_SECTION_LENGTHS) {
      sections.push(hex.slice(offset, offset + len));
      offset += len;
    }
    return sections.join("-");
  }

  // Fallback for environments without crypto.getRandomValues
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * HEX_RADIX);
    const v =
      c === "x" ? r : (r % VARIANT_FALLBACK_MOD) + VARIANT_FALLBACK_OFFSET; // 8..B
    return v.toString(HEX_RADIX);
  });
}
