import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface RelativeOrientationSensorInstance extends GenericSensorInstance {
  readonly quaternion: [number, number, number, number] | null;
}

/** The reading `useExperimentalRelativeOrientationSensor` reports — device rotation as a unit quaternion `[x, y, z, w]`. */
export interface RelativeOrientationReading {
  quaternion: [number, number, number, number] | null;
}

const readRelativeOrientation = (
  sensor: RelativeOrientationSensorInstance,
): RelativeOrientationReading => ({
  quaternion: sensor.quaternion,
});

/** The shape returned by `useExperimentalRelativeOrientationSensor`. */
export type UseExperimentalRelativeOrientationSensorResult =
  UseGenericSensorResult<RelativeOrientationReading>;

/**
 * Wraps the Generic Sensor API's `RelativeOrientationSensor` —
 * Experimental per MDN, Chromium-only, requires the `"accelerometer"` and
 * `"gyroscope"` Permissions Policies and a secure context. Reports device
 * rotation as a unit quaternion relative to an arbitrary starting
 * orientation — unlike `useExperimentalAbsoluteOrientationSensor`, it
 * doesn't use the magnetometer, so it drifts and ignores geomagnetic
 * north. `start()` constructs the sensor and begins reporting
 * `reading`/`activated`; a Permissions Policy block or a denied permission
 * prompt surfaces through `error` rather than a thrown exception.
 * `reading` stays `undefined` — the SSR-safe default — until the first
 * reading arrives.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalRelativeOrientationSensor({ frequency: 60 });
 * <button onClick={start} disabled={!supported}>Enable orientation sensor</button>
 * ```
 */
export const useExperimentalRelativeOrientationSensor = (
  options?: GenericSensorOptions,
): UseExperimentalRelativeOrientationSensorResult =>
  useGenericSensor<RelativeOrientationSensorInstance, RelativeOrientationReading>(
    "RelativeOrientationSensor",
    readRelativeOrientation,
    options,
  );
