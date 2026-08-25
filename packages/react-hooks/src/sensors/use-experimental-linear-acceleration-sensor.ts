import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface LinearAccelerationSensorInstance extends GenericSensorInstance {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

/** The reading `useExperimentalLinearAccelerationSensor` reports — acceleration in m/s² along each axis, gravity excluded. */
export interface LinearAccelerationReading {
  x: number | null;
  y: number | null;
  z: number | null;
}

const readLinearAcceleration = (
  sensor: LinearAccelerationSensorInstance,
): LinearAccelerationReading => ({
  x: sensor.x,
  y: sensor.y,
  z: sensor.z,
});

/** The shape returned by `useExperimentalLinearAccelerationSensor`. */
export type UseExperimentalLinearAccelerationSensorResult =
  UseGenericSensorResult<LinearAccelerationReading>;

/**
 * Wraps the Generic Sensor API's `LinearAccelerationSensor` — Experimental
 * per MDN, Chromium-only, requires the `"accelerometer"` Permissions
 * Policy and a secure context. Reports acceleration along the device's
 * x/y/z axes with the gravity component removed (unlike
 * `useExperimentalAccelerometer`). `start()` constructs the sensor and
 * begins reporting `reading`/`activated`; a Permissions Policy block or a
 * denied permission prompt surfaces through `error` rather than a thrown
 * exception. `reading` stays `undefined` — the SSR-safe default — until
 * the first reading arrives.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalLinearAccelerationSensor({ frequency: 60 });
 * <button onClick={start} disabled={!supported}>Enable linear acceleration</button>
 * ```
 */
export const useExperimentalLinearAccelerationSensor = (
  options?: GenericSensorOptions,
): UseExperimentalLinearAccelerationSensorResult =>
  useGenericSensor<LinearAccelerationSensorInstance, LinearAccelerationReading>(
    "LinearAccelerationSensor",
    readLinearAcceleration,
    options,
  );
