import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  getIsExtended,
  getScreenDetailsFn,
  getScreenEventTarget,
  type ScreenDetailed,
  type ScreenDetails,
} from "./_window-management-api.ts";

export type { ScreenDetailed, ScreenDetails } from "./_window-management-api.ts";

/** The shape returned by `useExperimentalWindowManagement`. */
export interface UseExperimentalWindowManagementResult {
  currentScreen: ScreenDetailed | undefined;
  isExtended: boolean;
  requestPermission: () => Promise<boolean>;
  screens: readonly ScreenDetailed[];
  supported: boolean;
}

const subscribeIsExtended = (onStoreChange: () => void) => {
  const screen = getScreenEventTarget();
  if (!screen?.addEventListener) {
    return () => {};
  }
  screen.addEventListener("change", onStoreChange);
  return () => screen.removeEventListener?.("change", onStoreChange);
};

const getIsExtendedServerSnapshot = (): boolean => false;

/**
 * Wraps the Window Management API — Experimental per MDN, Chromium-only,
 * requires the `"window-management"` permission and a secure context — for
 * placing windows across multiple screens.
 *
 * `isExtended` mirrors `window.screen.isExtended` — `true` once more than
 * one display is connected — updating on the `screen`'s `change` event,
 * and needs no permission prompt. `requestPermission()` calls
 * `window.getScreenDetails()`, resolving `false` when the API is missing
 * or the user denies it; once granted, `screens` (every connected
 * display) and `currentScreen` (the one showing this window) populate and
 * stay live, updating on the underlying `screenschange`/
 * `currentscreenchange` events — a display connecting/disconnecting, or
 * the window moving to another one. `screens`/`currentScreen` stay
 * empty/`undefined` — the SSR-safe default — until permission is granted.
 *
 * Experimental per MDN, Chromium-only, not Baseline — see
 * [MDN's browser compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API#browser_compatibility).
 *
 * @example
 * ```tsx
 * const { isExtended, screens, currentScreen, requestPermission } = useExperimentalWindowManagement();
 * <button onClick={requestPermission} disabled={!isExtended}>
 *   Show all {screens.length} screens
 * </button>;
 * ```
 */
export const useExperimentalWindowManagement = (): UseExperimentalWindowManagementResult => {
  const supported = Boolean(getScreenDetailsFn());
  const isExtended = useSyncExternalStore(
    subscribeIsExtended,
    getIsExtended,
    getIsExtendedServerSnapshot,
  );
  const [screens, setScreens] = useState<readonly ScreenDetailed[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenDetailed | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const getScreenDetails = getScreenDetailsFn();
    if (!getScreenDetails) {
      return false;
    }

    try {
      const details: ScreenDetails = await getScreenDetails();
      cleanupRef.current?.();

      const handleScreensChange = () => setScreens([...details.screens]);
      const handleCurrentScreenChange = () => setCurrentScreen(details.currentScreen);

      // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- registered inside a user-triggered `requestPermission()`, not the effect's mount body; `cleanupRef` (invoked here and on unmount by the effect further down) always removes these listeners, just via indirection the rule's matcher misses.
      details.addEventListener("screenschange", handleScreensChange);
      details.addEventListener("currentscreenchange", handleCurrentScreenChange);
      cleanupRef.current = () => {
        details.removeEventListener("screenschange", handleScreensChange);
        details.removeEventListener("currentscreenchange", handleCurrentScreenChange);
      };

      handleScreensChange();
      handleCurrentScreenChange();
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { currentScreen, isExtended, requestPermission, screens, supported };
};
