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

/** The reading from `useExperimentalGravitySensor`. Just the gravity part of acceleration, in m/s² along each axis. */
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
 * Reads the device's `GravitySensor`. This is experimental, only works in
 * Chrome, needs the `"accelerometer"` permission, and needs a secure
 * (HTTPS) page. Reports just the gravity part of acceleration along the
 * device's x/y/z axes, in m/s². This is the opposite of what
 * `useExperimentalLinearAccelerationSensor` reports.
 *
 * Call `start()` to create the sensor and start getting readings. If a
 * permission is blocked or denied, you see that in `error` instead of a
 * thrown error. `reading` stays `undefined` until the first reading
 * arrives, which is safe for server-side rendering.
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
