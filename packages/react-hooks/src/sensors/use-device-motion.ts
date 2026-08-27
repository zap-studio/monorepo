import { useEffect, useMemo, useState } from "react";

interface DeviceMotionEventConstructorWithPermission {
  requestPermission?: () => Promise<"denied" | "granted">;
}

/** The motion fields `useDeviceMotion` reports — mirrors `DeviceMotionEvent`. */
export interface DeviceMotionState {
  acceleration: DeviceMotionEvent["acceleration"];
  accelerationIncludingGravity: DeviceMotionEvent["accelerationIncludingGravity"];
  interval: number;
  rotationRate: DeviceMotionEvent["rotationRate"];
}

/** The shape returned by `useDeviceMotion`. */
export interface UseDeviceMotionResult extends DeviceMotionState {
  requestPermission: () => Promise<boolean>;
  supported: boolean;
}

const INITIAL_STATE: DeviceMotionState = {
  acceleration: null,
  accelerationIncludingGravity: null,
  interval: 0,
  rotationRate: null,
};

const toState = (event: DeviceMotionEvent): DeviceMotionState => ({
  acceleration: event.acceleration,
  accelerationIncludingGravity: event.accelerationIncludingGravity,
  interval: event.interval,
  rotationRate: event.rotationRate,
});

const requestDeviceMotionPermission = async (): Promise<boolean> => {
  // SAFETY: requestPermission is a permission check that only iOS Safari has, and TypeScript's DOM types don't include it. It's optional-chained, so other platforms (most of them) skip straight to "granted".
  const requestPermission = (DeviceMotionEvent as DeviceMotionEventConstructorWithPermission)
    .requestPermission;
  if (!requestPermission) {
    return true;
  }
  return (await requestPermission()) === "granted";
};

/**
 * Device acceleration from the `devicemotion` event. There is no way to
 * read this value directly, only to listen for the event. So this starts
 * with all fields `null` (`interval: 0`, also the safe default for server
 * rendering) until the first event fires. Has the same iOS Safari
 * permission requirement as `useDeviceOrientation`: `requestPermission()`
 * simply resolves to `true` on platforms that don't need permission.
 *
 * @example
 * ```tsx
 * const { acceleration, supported, requestPermission } = useDeviceMotion();
 * <button onClick={requestPermission}>Enable motion controls</button>
 * ```
 */
export const useDeviceMotion = (): UseDeviceMotionResult => {
  const [state, setState] = useState<DeviceMotionState>(INITIAL_STATE);
  const supported = typeof window !== "undefined" && Boolean(window.DeviceMotionEvent);

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      setState(toState(event));
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, []);

  return useMemo(
    () => ({ ...state, requestPermission: requestDeviceMotionPermission, supported }),
    [state, supported],
  );
};
