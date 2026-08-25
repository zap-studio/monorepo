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

/** The reading `useExperimentalAmbientLightSensor` reports — ambient light level in lux. */
export interface AmbientLightReading {
  illuminance: number | null;
}

const readAmbientLight = (sensor: AmbientLightSensorInstance): AmbientLightReading => ({
  illuminance: sensor.illuminance,
});

/** The shape returned by `useExperimentalAmbientLightSensor`. */
export type UseExperimentalAmbientLightSensorResult = UseGenericSensorResult<AmbientLightReading>;

/**
 * Wraps the Generic Sensor API's `AmbientLightSensor` — Experimental per
 * MDN, Chromium-only, requires the `"ambient-light-sensor"` Permissions
 * Policy and a secure context. Reports ambient light level in lux.
 * `start()` constructs the sensor and begins reporting
 * `reading`/`activated`; a Permissions Policy block or a denied permission
 * prompt surfaces through `error` rather than a thrown exception.
 * `reading` stays `undefined` — the SSR-safe default — until the first
 * reading arrives.
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
