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

  // oxlint-disable-next-line github/no-dynamic-script-tag -- loading a script on demand is what this hook does. The caller gives the src, like any other URL we fetch.
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
 * Loads an external script (`<script src>`) when needed. If you call
 * `useScript` more than once with the same `src`, all calls share a
 * single `<script>` tag, so the script is never loaded twice.
 *
 * `status` starts as `"loading"` and becomes `"ready"` or `"error"` once
 * the script finishes loading. If the script already finished loading
 * before this call, `status` reflects that right away. With
 * `removeOnUnmount: true`, the `<script>` tag is removed once the last
 * component using that `src` unmounts.
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
    // oxlint-disable-next-line react/set-state-in-effect -- `registry` is a module-level store shared across every instance loading the same `src`; another instance may have advanced `entry.status` since this instance's lazy initial state read it, so it must be re-synced here.
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
