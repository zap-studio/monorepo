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
  screen.addEventListener("change", onStoreChange);
  return () => screen.removeEventListener("change", onStoreChange);
};

const getIsExtendedServerSnapshot = (): boolean => false;

/**
 * Reads and manages multiple screens, using the Window Management API.
 * This is experimental, only works in Chrome, and needs the
 * `"window-management"` permission, plus a secure (HTTPS) page.
 *
 * `isExtended` mirrors `window.screen.isExtended`: it's `true` once more
 * than one display is connected. It updates on its own and doesn't need a
 * permission prompt.
 *
 * Call `requestPermission()` to ask for permission and get the list of
 * screens. It resolves `false` if the API is missing or the user denies
 * it. Once granted, `screens` (every connected display) and
 * `currentScreen` (the one showing this window) fill in and stay up to
 * date on their own, for example when a display connects, disconnects, or
 * the window moves to another screen. Both stay empty/`undefined` until
 * permission is granted, which is safe for server-side rendering.
 *
 * This API is still experimental and only works in Chrome. See
 * [MDN's browser compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API#browser_compatibility)
 * for details.
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

      // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- These listeners are added inside `requestPermission()`, not inside the effect body, so the linter can't see the cleanup. But `cleanupRef` always removes them: here, and when the component unmounts.
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
