import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface MagnetometerSensor extends GenericSensorInstance {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

/** The reading from `useExperimentalMagnetometer`. The magnetic field in µT along each axis. */
export interface MagnetometerReading {
  x: number | null;
  y: number | null;
  z: number | null;
}

const readMagnetometer = (sensor: MagnetometerSensor): MagnetometerReading => ({
  x: sensor.x,
  y: sensor.y,
  z: sensor.z,
});

/** The shape returned by `useExperimentalMagnetometer`. */
export type UseExperimentalMagnetometerResult = UseGenericSensorResult<MagnetometerReading>;

/**
 * Reads the device's `Magnetometer`. This is experimental, only works in
 * Chrome, needs the `"magnetometer"` permission, and needs a secure
 * (HTTPS) page. Reports the magnetic field around the device along its
 * x/y/z axes.
 *
 * Call `start()` to create the sensor and start getting readings. If a
 * permission is blocked or denied, you see that in `error` instead of a
 * thrown error. `reading` stays `undefined` until the first reading
 * arrives, which is safe for server-side rendering.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalMagnetometer({ frequency: 10 });
 * <button onClick={start} disabled={!supported}>Enable magnetometer</button>
 * ```
 */
export const useExperimentalMagnetometer = (
  options?: GenericSensorOptions,
): UseExperimentalMagnetometerResult =>
  useGenericSensor<MagnetometerSensor, MagnetometerReading>(
    "Magnetometer",
    readMagnetometer,
    options,
  );
