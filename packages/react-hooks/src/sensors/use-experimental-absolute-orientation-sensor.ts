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

/** The reading from `useExperimentalAbsoluteOrientationSensor`. It gives the device's rotation as a quaternion `[x, y, z, w]`. */
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
 * Reads the device's `AbsoluteOrientationSensor`. This is experimental,
 * only works in Chrome, needs the `"accelerometer"`, `"gyroscope"`, and
 * `"magnetometer"` permissions, and needs a secure (HTTPS) page. Reports
 * the device's rotation compared to Earth (using magnetic north) as a
 * quaternion.
 *
 * Call `start()` to create the sensor and start getting readings. If a
 * permission is blocked or denied, you see that in `error` instead of a
 * thrown error. `reading` stays `undefined` until the first reading
 * arrives, which is safe for server-side rendering.
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
