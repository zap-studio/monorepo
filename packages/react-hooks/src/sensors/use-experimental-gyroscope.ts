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

/** The reading from `useExperimentalGyroscope`. Rotation speed in rad/s around each axis. */
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
 * Reads the device's `Gyroscope`. This is experimental, only works in
 * Chrome, needs the `"gyroscope"` permission, and needs a secure (HTTPS)
 * page. Reports how fast the device is rotating around its x/y/z axes, in
 * rad/s.
 *
 * Call `start()` to create the sensor and start getting readings. If a
 * permission is blocked or denied, you see that in `error` instead of a
 * thrown error. `reading` stays `undefined` until the first reading
 * arrives, which is safe for server-side rendering.
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
