import {
  type GenericSensorInstance,
  type GenericSensorOptions,
  useGenericSensor,
  type UseGenericSensorResult,
} from "./_generic-sensor-api.ts";

export type { GenericSensorOptions } from "./_generic-sensor-api.ts";

interface AmbientLightSensorInstance extends GenericSensorInstance {
  readonly illuminance: number | null;
}

/** The reading from `useExperimentalAmbientLightSensor`. The light level around the device, in lux. */
export interface AmbientLightReading {
  illuminance: number | null;
}

const readAmbientLight = (sensor: AmbientLightSensorInstance): AmbientLightReading => ({
  illuminance: sensor.illuminance,
});

/** The shape returned by `useExperimentalAmbientLightSensor`. */
export type UseExperimentalAmbientLightSensorResult = UseGenericSensorResult<AmbientLightReading>;

/**
 * Reads the device's `AmbientLightSensor`. This is experimental, only
 * works in Chrome, needs the `"ambient-light-sensor"` permission, and
 * needs a secure (HTTPS) page. Reports the light level around the device,
 * in lux.
 *
 * Call `start()` to create the sensor and start getting readings. If a
 * permission is blocked or denied, you see that in `error` instead of a
 * thrown error. `reading` stays `undefined` until the first reading
 * arrives, which is safe for server-side rendering.
 *
 * @example
 * ```tsx
 * const { reading, supported, start } = useExperimentalAmbientLightSensor();
 * <button onClick={start} disabled={!supported}>Enable ambient light sensor</button>
 * ```
 */
export const useExperimentalAmbientLightSensor = (
  options?: GenericSensorOptions,
): UseExperimentalAmbientLightSensorResult =>
  useGenericSensor<AmbientLightSensorInstance, AmbientLightReading>(
    "AmbientLightSensor",
    readAmbientLight,
    options,
  );
