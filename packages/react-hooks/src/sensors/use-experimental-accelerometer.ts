import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface AccelerometerSensor extends GenericSensorInstance {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

/** The reading from `useExperimentalAccelerometer`. Acceleration in m/s² along each axis. */
export interface AccelerometerReading {
  x: number | null;
  y: number | null;
  z: number | null;
}

const readAccelerometer = (sensor: AccelerometerSensor): AccelerometerReading => ({
  x: sensor.x,
  y: sensor.y,
  z: sensor.z,
});

/** The shape returned by `useExperimentalAccelerometer`. */
export type UseExperimentalAccelerometerResult = UseGenericSensorResult<AccelerometerReading>;

/**
 * Reads the device's `Accelerometer`. This is experimental, only works in
 * Chrome, needs the `"accelerometer"` permission, and needs a secure
 * (HTTPS) page. Reports acceleration (including gravity) along the
 * device's x/y/z axes, in m/s².
 *
 * Call `start()` to create the sensor and start getting readings. If a
 * permission is blocked or denied, you see that in `error` instead of a
 * thrown error. `reading` stays `undefined` until the first reading
 * arrives, which is safe for server-side rendering.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalAccelerometer({ frequency: 60 });
 * <button onClick={start} disabled={!supported}>Enable accelerometer</button>
 * ```
 */
export const useExperimentalAccelerometer = (
  options?: GenericSensorOptions,
): UseExperimentalAccelerometerResult =>
  useGenericSensor<AccelerometerSensor, AccelerometerReading>(
    "Accelerometer",
    readAccelerometer,
    options,
  );
