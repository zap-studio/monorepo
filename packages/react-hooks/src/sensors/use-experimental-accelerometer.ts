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

/** The reading `useExperimentalAccelerometer` reports — acceleration in m/s² along each axis. */
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
 * Wraps the Generic Sensor API's `Accelerometer` — Experimental per MDN,
 * Chromium-only, requires the `"accelerometer"` Permissions Policy and a
 * secure context. Reports acceleration (including gravity) along the
 * device's x/y/z axes. `start()` constructs the sensor and begins
 * reporting `reading`/`activated`; a Permissions Policy block or a denied
 * permission prompt surfaces through `error` rather than a thrown
 * exception. `reading` stays `undefined` — the SSR-safe default — until
 * the first reading arrives.
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
