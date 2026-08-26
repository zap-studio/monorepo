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

/** The reading from `useExperimentalRelativeOrientationSensor`. It gives the device's rotation as a quaternion `[x, y, z, w]`. */
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
 * Reads the device's `RelativeOrientationSensor`. This is experimental,
 * only works in Chrome, needs the `"accelerometer"` and `"gyroscope"`
 * permissions, and needs a secure (HTTPS) page. Reports the device's
 * rotation as a quaternion, compared to wherever it started (not compared
 * to Earth). Unlike `useExperimentalAbsoluteOrientationSensor`, it doesn't
 * use the magnetometer, so it can drift over time and ignores magnetic
 * north.
 *
 * Call `start()` to create the sensor and start getting readings. If a
 * permission is blocked or denied, you see that in `error` instead of a
 * thrown error. `reading` stays `undefined` until the first reading
 * arrives, which is safe for server-side rendering.
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
