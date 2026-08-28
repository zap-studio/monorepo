import { useEffect, useMemo, useState } from "react";

interface DeviceOrientationEventConstructorWithPermission {
  requestPermission?: () => Promise<"denied" | "granted">;
}

/** The tilt fields `useDeviceOrientation` reports — mirrors `DeviceOrientationEvent`. */
export interface DeviceOrientationState {
  absolute: boolean;
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

/** The shape returned by `useDeviceOrientation`. */
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
  // SAFETY: requestPermission is a permission check that only iOS Safari has, so it is not declared on the event constructor. We read it as optional, so other platforms (most of them) go straight to "granted".
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
 * events (using the accelerometer/magnetometer). There is no way to read
 * this value directly, only to listen for the event. So this starts at
 * `{ alpha: null, beta: null, gamma: null, absolute: false }` (also the
 * safe default for server rendering) until the first event fires. iOS
 * Safari requires the user to tap something first: call
 * `requestPermission()` from a click handler before relying on the values.
 * On platforms that don't need permission, it simply resolves to `true`.
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

  return useMemo(
    () => ({ ...state, requestPermission: requestDeviceOrientationPermission, supported }),
    [state, supported],
  );
};
