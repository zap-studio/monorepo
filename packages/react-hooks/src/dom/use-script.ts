import { useEffect, useState } from "react";

/** Status reported by `useScript`. */
export type ScriptStatus = "error" | "idle" | "loading" | "ready";

/** Options accepted by `useScript`. */
export interface UseScriptOptions {
  async?: boolean;
  /** Remove the `<script>` tag when the last consumer of this `src` unmounts. Defaults to `false`. */
  removeOnUnmount?: boolean;
}

/** The shape returned by `useScript`. */
export interface UseScriptResult {
  status: ScriptStatus;
}

interface ScriptEntry {
  refCount: number;
  script: HTMLScriptElement;
  status: ScriptStatus;
}

const registry = new Map<string, ScriptEntry>();

const getOrCreateEntry = (src: string, async: boolean | undefined): ScriptEntry => {
  const existing = registry.get(src);
  if (existing) {
    return existing;
  }

  // oxlint-disable-next-line github/no-dynamic-script-tag -- on-demand script loading is this hook's entire purpose; the src is caller-supplied, same trust boundary as any other API URL this codebase fetches.
  const script = document.createElement("script");
  script.src = src;
  script.async = async ?? true;

  const entry: ScriptEntry = { refCount: 0, script, status: "loading" };
  registry.set(src, entry);

  script.addEventListener("load", () => {
    entry.status = "ready";
  });
  script.addEventListener("error", () => {
    entry.status = "error";
  });

  document.body.append(script);
  return entry;
};

/**
 * Loads an external `<script src>` on demand. Concurrent `useScript` calls
 * for the same `src` share a single `<script>` tag — the request is never
 * duplicated. `status` starts `"loading"` and becomes `"ready"`/`"error"`
 * once the script settles (or immediately reflects an already-settled
 * script for later consumers). With `removeOnUnmount: true`, the tag is
 * removed once the last consumer of that `src` unmounts.
 *
 * @example
 * ```tsx
 * const { status } = useScript("https://maps.example.com/sdk.js");
 * if (status === "ready") renderMap();
 * ```
 */
export const useScript = (src: string, options?: UseScriptOptions): UseScriptResult => {
  const [status, setStatus] = useState<ScriptStatus>(() => registry.get(src)?.status ?? "loading");

  useEffect(() => {
    const entry = getOrCreateEntry(src, options?.async);
    entry.refCount += 1;
    setStatus(entry.status);

    const handleLoad = () => setStatus("ready");
    const handleError = () => setStatus("error");
    entry.script.addEventListener("load", handleLoad);
    entry.script.addEventListener("error", handleError);

    return () => {
      entry.script.removeEventListener("load", handleLoad);
      entry.script.removeEventListener("error", handleError);
      entry.refCount -= 1;
      if (entry.refCount <= 0 && options?.removeOnUnmount) {
        entry.script.remove();
        registry.delete(src);
      }
    };
  }, [src, options?.async, options?.removeOnUnmount]);

  return { status };
};
