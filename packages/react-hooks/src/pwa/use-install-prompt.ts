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
 * Lets you build a custom "Add to Home Screen" button. It wraps the
 * `beforeinstallprompt` event (which it holds onto and replays later when
 * you call `promptInstall()`, since the browser's own prompt is
 * suppressed) and the `appinstalled` event. `canInstall` and `installed`
 * both start as `false` (safe for server-side rendering) until the client
 * sees the matching event. `canInstall` stays `false` forever in browsers
 * that never fire `beforeinstallprompt`, like Safari and Firefox.
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
      // SAFETY: beforeinstallprompt is a non-standard event that only Chromium browsers fire, and it isn't declared in TypeScript's DOM types. This listener is only ever added for this exact event name, so the object it receives always has this shape at runtime.
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
