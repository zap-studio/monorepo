import type { ZodType } from "zod";
import { FetchError } from "@/zap/errors";
import { BASE_URL } from "@/zap.config";

/**
 * Resolve the base URL depending on runtime.
 * - Client side: window.location.origin
 * - Server/Edge: BASE_URL from zap.config.ts
 */
function getBaseURL(): string {
  if (window?.location?.origin) {
    return window.location.origin;
  }
  return BASE_URL;
}

const BASE = getBaseURL();

/** Options for the $fetch helper. */
export interface FetchOptions<TData = unknown> extends RequestInit {
  /** Optional zod schema to validate & type the JSON response. */
  schema?: ZodType<TData>;
  /** Automatically treat non-2xx responses as errors (default true). */
  throwOnError?: boolean;
  /** If true returns raw Response instead of parsed JSON (schema ignored). */
  raw?: boolean;
}

/**
 * A small wrapper around the native fetch providing:
 * - Base URL resolution
 * - JSON parsing
 * - Optional zod validation
 * - Consistent error throwing on non-ok responses
 */
const ABSOLUTE_URL_REGEX = /^https?:/i; // hoisted per lint rule

export async function $fetch<TData = unknown>(
  input: string,
  options: FetchOptions<TData> = {}
): Promise<TData> {
  const {
    schema,
    throwOnError = true,
    raw = false,
    headers,
    ...init
  } = options;

  const url = ABSOLUTE_URL_REGEX.test(input) ? input : `${BASE}${input}`;

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (raw) {
    return response as unknown as TData;
  }

  let data: unknown = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      // ignore json parse errors; data stays null
    }
  } else {
    // fallback to text for non-json to include in error context
    try {
      data = await response.text();
    } catch {
      /* ignore */
    }
  }

  if (throwOnError && !response.ok) {
    throw new FetchError(
      `Request failed with status ${response.status}`,
      response,
      data
    );
  }

  if (schema) {
    return schema.parse(data) as TData;
  }

  return data as TData;
}
