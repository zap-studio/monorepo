import { useEffect, useState } from "react";

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
  // SAFETY: requestPermission is an iOS Safari-only static gate not declared in TypeScript's DOM lib; optional-chained, so platforms without it (the vast majority) just skip straight to "granted".
  const requestPermission = (DeviceMotionEvent as DeviceMotionEventConstructorWithPermission)
    .requestPermission;
  if (!requestPermission) {
    return true;
  }
  return (await requestPermission()) === "granted";
};

/**
 * Device acceleration from the `devicemotion` event — there's no
 * synchronous read, only the event, so this starts all-`null` (`interval:
 * 0`, also the SSR-safe default) until one fires. Same iOS Safari
 * user-gesture permission caveat as `useDeviceOrientation` —
 * `requestPermission()` resolves `true` (no-op success) on platforms
 * without the gate.
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

  return { ...state, requestPermission: requestDeviceMotionPermission, supported };
};
