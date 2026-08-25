import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface GravitySensorInstance extends GenericSensorInstance {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

/** The reading `useExperimentalGravitySensor` reports — the gravity component of acceleration in m/s² along each axis. */
export interface GravityReading {
  x: number | null;
  y: number | null;
  z: number | null;
}

const readGravity = (sensor: GravitySensorInstance): GravityReading => ({
  x: sensor.x,
  y: sensor.y,
  z: sensor.z,
});

/** The shape returned by `useExperimentalGravitySensor`. */
export type UseExperimentalGravitySensorResult = UseGenericSensorResult<GravityReading>;

/**
 * Wraps the Generic Sensor API's `GravitySensor` — Experimental per MDN,
 * Chromium-only, requires the `"accelerometer"` Permissions Policy and a
 * secure context. Reports only the gravity component of acceleration
 * along the device's x/y/z axes (the complement of
 * `useExperimentalLinearAccelerationSensor`). `start()` constructs the
 * sensor and begins reporting `reading`/`activated`; a Permissions Policy
 * block or a denied permission prompt surfaces through `error` rather
 * than a thrown exception. `reading` stays `undefined` — the SSR-safe
 * default — until the first reading arrives.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalGravitySensor({ frequency: 60 });
 * <button onClick={start} disabled={!supported}>Enable gravity sensor</button>
 * ```
 */
export const useExperimentalGravitySensor = (
  options?: GenericSensorOptions,
): UseExperimentalGravitySensorResult =>
  useGenericSensor<GravitySensorInstance, GravityReading>("GravitySensor", readGravity, options);
