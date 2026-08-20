import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/** The shape returned by `useInstallPrompt`. */
export interface UseInstallPromptResult {
  canInstall: boolean;
  installed: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

/**
 * Custom "Add to Home Screen" UI, wrapping `beforeinstallprompt` (deferred
 * and replayed via `promptInstall()`, since the browser's own prompt is
 * suppressed) and `appinstalled`. `canInstall`/`installed` are both
 * `false` — the SSR-safe default — until the client observes the
 * respective event, and `canInstall` stays `false` permanently in
 * browsers that never fire `beforeinstallprompt` (Safari, Firefox).
 *
 * @example
 * ```tsx
 * const { canInstall, promptInstall } = useInstallPrompt();
 * if (canInstall) return <button onClick={() => promptInstall()}>Install</button>;
 * ```
 */
export const useInstallPrompt = (): UseInstallPromptResult => {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      // SAFETY: beforeinstallprompt is a non-standard, Chromium-only event not declared in TypeScript's DOM lib; the listener is only ever registered on this exact event name, so the object it receives is always shaped this way at runtime.
      deferredRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      deferredRef.current = null;
      setCanInstall(false);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    const deferred = deferredRef.current;
    if (!deferred) {
      return "unavailable";
    }
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferredRef.current = null;
    setCanInstall(false);
    return outcome;
  }, []);

  return { canInstall, installed, promptInstall };
};
