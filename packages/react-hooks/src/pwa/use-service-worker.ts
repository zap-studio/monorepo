import { useEffect, useState } from "react";

/** The shape returned by `useServiceWorker`. */
export interface UseServiceWorkerResult {
  registration: ServiceWorkerRegistration | undefined;
  supported: boolean;
  updateAvailable: boolean;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && Boolean(navigator.serviceWorker);

/**
 * The current page's Service Worker registration (if any), plus whether a
 * new worker has finished installing while an existing one already
 * controls the page — the standard "update available, reload to activate"
 * signal. `registration` is `undefined` — the SSR-safe default — until
 * the client resolves it, and permanently where Service Workers are
 * unsupported.
 *
 * @example
 * ```tsx
 * const { updateAvailable } = useServiceWorker();
 * if (updateAvailable) showReloadToast();
 * ```
 */
export const useServiceWorker = (): UseServiceWorkerResult => {
  const supported = isSupported();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | undefined>(
    undefined,
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!isSupported()) {
      return undefined;
    }

    let cancelled = false;
    const cleanupFns: (() => void)[] = [];

    const handleUpdateFound = (reg: ServiceWorkerRegistration) => {
      const installingWorker = reg.installing;
      if (!installingWorker) {
        return;
      }
      const handleStateChange = () => {
        if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }
      };
      installingWorker.addEventListener("statechange", handleStateChange);
      cleanupFns.push(() => installingWorker.removeEventListener("statechange", handleStateChange));
    };

    const subscribeToRegistration = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (cancelled || !reg) {
        return;
      }
      setRegistration(reg);
      const handleUpdateFoundForReg = () => handleUpdateFound(reg);
      reg.addEventListener("updatefound", handleUpdateFoundForReg);
      cleanupFns.push(() => reg.removeEventListener("updatefound", handleUpdateFoundForReg));
    };

    void subscribeToRegistration();

    return () => {
      cancelled = true;
      for (const fn of cleanupFns) {
        fn();
      }
    };
  }, []);

  return { registration, supported, updateAvailable };
};
