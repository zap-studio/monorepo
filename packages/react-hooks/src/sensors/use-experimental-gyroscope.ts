import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface GyroscopeSensor extends GenericSensorInstance {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

/** The reading `useExperimentalGyroscope` reports — angular velocity in rad/s around each axis. */
export interface GyroscopeReading {
  x: number | null;
  y: number | null;
  z: number | null;
}

const readGyroscope = (sensor: GyroscopeSensor): GyroscopeReading => ({
  x: sensor.x,
  y: sensor.y,
  z: sensor.z,
});

/** The shape returned by `useExperimentalGyroscope`. */
export type UseExperimentalGyroscopeResult = UseGenericSensorResult<GyroscopeReading>;

/**
 * Wraps the Generic Sensor API's `Gyroscope` — Experimental per MDN,
 * Chromium-only, requires the `"gyroscope"` Permissions Policy and a
 * secure context. Reports angular velocity around the device's x/y/z axes.
 * `start()` constructs the sensor and begins reporting
 * `reading`/`activated`; a Permissions Policy block or a denied permission
 * prompt surfaces through `error` rather than a thrown exception.
 * `reading` stays `undefined` — the SSR-safe default — until the first
 * reading arrives.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalGyroscope({ frequency: 60 });
 * <button onClick={start} disabled={!supported}>Enable gyroscope</button>
 * ```
 */
export const useExperimentalGyroscope = (
  options?: GenericSensorOptions,
): UseExperimentalGyroscopeResult =>
  useGenericSensor<GyroscopeSensor, GyroscopeReading>("Gyroscope", readGyroscope, options);
