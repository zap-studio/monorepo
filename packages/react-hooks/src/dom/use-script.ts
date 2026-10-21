import { useCallback, useEffect, useSyncExternalStore } from "react";

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
const getServerSnapshot = (): ScriptStatus => "loading";

export const useScript = (src: string, options?: UseScriptOptions): UseScriptResult => {
  const async = options?.async;
  const removeOnUnmount = options?.removeOnUnmount;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const entry = getOrCreateEntry(src, async);
      entry.script.addEventListener("load", onStoreChange);
      entry.script.addEventListener("error", onStoreChange);
      return () => {
        entry.script.removeEventListener("load", onStoreChange);
        entry.script.removeEventListener("error", onStoreChange);
      };
    },
    [src, async],
  );

  const getSnapshot = useCallback(
    (): ScriptStatus => registry.get(src)?.status ?? "loading",
    [src],
  );

  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const entry = getOrCreateEntry(src, async);
    entry.refCount += 1;

    return () => {
      entry.refCount -= 1;
      if (entry.refCount <= 0 && removeOnUnmount) {
        entry.script.remove();
        registry.delete(src);
      }
    };
  }, [src, async, removeOnUnmount]);

  return { status };
};
