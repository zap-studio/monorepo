import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface AbsoluteOrientationSensorInstance extends GenericSensorInstance {
  readonly quaternion: [number, number, number, number] | null;
}

/** The reading `useExperimentalAbsoluteOrientationSensor` reports — device rotation as a unit quaternion `[x, y, z, w]`. */
export interface AbsoluteOrientationReading {
  quaternion: [number, number, number, number] | null;
}

const readAbsoluteOrientation = (
  sensor: AbsoluteOrientationSensorInstance,
): AbsoluteOrientationReading => ({
  quaternion: sensor.quaternion,
});

/** The shape returned by `useExperimentalAbsoluteOrientationSensor`. */
export type UseExperimentalAbsoluteOrientationSensorResult =
  UseGenericSensorResult<AbsoluteOrientationReading>;

/**
 * Wraps the Generic Sensor API's `AbsoluteOrientationSensor` —
 * Experimental per MDN, Chromium-only, requires the `"accelerometer"`,
 * `"gyroscope"`, and `"magnetometer"` Permissions Policies and a secure
 * context. Reports device rotation relative to Earth's reference frame
 * (geomagnetic north) as a unit quaternion. `start()` constructs the
 * sensor and begins reporting `reading`/`activated`; a Permissions Policy
 * block or a denied permission prompt surfaces through `error` rather
 * than a thrown exception. `reading` stays `undefined` — the SSR-safe
 * default — until the first reading arrives.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalAbsoluteOrientationSensor({ frequency: 60 });
 * <button onClick={start} disabled={!supported}>Enable orientation sensor</button>
 * ```
 */
export const useExperimentalAbsoluteOrientationSensor = (
  options?: GenericSensorOptions,
): UseExperimentalAbsoluteOrientationSensorResult =>
  useGenericSensor<AbsoluteOrientationSensorInstance, AbsoluteOrientationReading>(
    "AbsoluteOrientationSensor",
    readAbsoluteOrientation,
    options,
  );
