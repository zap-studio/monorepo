import { useEffect, useState } from "react";

interface DeviceOrientationEventConstructorWithPermission {
  requestPermission?: () => Promise<"denied" | "granted">;
}

export interface DeviceOrientationState {
  absolute: boolean;
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export interface UseDeviceOrientationResult extends DeviceOrientationState {
  requestPermission: () => Promise<boolean>;
  supported: boolean;
}

const INITIAL_STATE: DeviceOrientationState = {
  absolute: false,
  alpha: null,
  beta: null,
  gamma: null,
};

const toState = (event: DeviceOrientationEvent): DeviceOrientationState => ({
  absolute: event.absolute,
  alpha: event.alpha,
  beta: event.beta,
  gamma: event.gamma,
});

const requestDeviceOrientationPermission = async (): Promise<boolean> => {
  // SAFETY: requestPermission is an iOS Safari-only static gate not declared in TypeScript's DOM lib; optional-chained, so platforms without it (the vast majority) just skip straight to "granted".
  const requestPermission = (
    DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission
  ).requestPermission;
  if (!requestPermission) {
    return true;
  }
  return (await requestPermission()) === "granted";
};

/**
 * Device tilt from the `deviceorientation`/`deviceorientationabsolute`
 * events (accelerometer/magnetometer) — there's no synchronous read, only
 * the event, so this starts at `{ alpha: null, beta: null, gamma: null,
 * absolute: false }` (also the SSR-safe default) until one fires. iOS
 * Safari gates this behind a user-gesture permission prompt — call
 * `requestPermission()` from a click handler before relying on the values;
 * it resolves `true` (no-op success) on platforms without the gate.
 *
 * @example
 * ```tsx
 * const { alpha, beta, gamma, supported, requestPermission } = useDeviceOrientation();
 * <button onClick={requestPermission}>Enable tilt controls</button>
 * ```
 */
export const useDeviceOrientation = (): UseDeviceOrientationResult => {
  const [state, setState] = useState<DeviceOrientationState>(INITIAL_STATE);
  const supported = typeof window !== "undefined" && Boolean(window.DeviceOrientationEvent);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setState(toState(event));
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("deviceorientationabsolute", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
    };
  }, []);

  return { ...state, requestPermission: requestDeviceOrientationPermission, supported };
};
