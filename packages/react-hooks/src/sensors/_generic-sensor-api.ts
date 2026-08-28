import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** A small copy of the Generic Sensor API's types. This is an experimental, Chrome-only API, not declared elsewhere. */
export interface GenericSensorErrorEvent extends Event {
  readonly error: DOMException;
}

/** Shape common to every Generic Sensor API sensor instance (`Accelerometer`, `Gyroscope`, etc). */
export interface GenericSensorInstance extends EventTarget {
  readonly activated: boolean;
  readonly hasReading: boolean;
  onerror: ((this: GenericSensorInstance, event: GenericSensorErrorEvent) => void) | null;
  onreading: ((this: GenericSensorInstance, event: Event) => void) | null;
  start(): void;
  stop(): void;
}

/** Options every Generic Sensor API constructor accepts. */
export interface GenericSensorOptions {
  frequency?: number;
}

type GenericSensorConstructor<TSensor extends GenericSensorInstance> = new (
  options?: GenericSensorOptions,
) => TSensor;

/** Every Generic Sensor API constructor this package looks up on `window`. */
export type GenericSensorConstructorName =
  | "AbsoluteOrientationSensor"
  | "Accelerometer"
  | "AmbientLightSensor"
  | "GravitySensor"
  | "Gyroscope"
  | "LinearAccelerationSensor"
  | "Magnetometer"
  | "RelativeOrientationSensor";

/**
 * `window` widened with the sensor constructors, each optional because an
 * unsupported browser (Safari, Firefox) leaves them undefined.
 */
type WindowWithGenericSensors<TSensor extends GenericSensorInstance> = Window & {
  readonly [K in GenericSensorConstructorName]?: GenericSensorConstructor<TSensor>;
};

/**
 * Checks `typeof window === "undefined"`. Every sensor hook reads this
 * directly in the hook body on every render, including server-side
 * rendering, not only inside an effect.
 */
const getGenericSensorConstructor = <TSensor extends GenericSensorInstance>(
  constructorName: GenericSensorConstructorName,
): GenericSensorConstructor<TSensor> | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: these sensor constructors aren't declared on Window; read as optional so an unsupported browser (Safari, Firefox) gives undefined instead of throwing.
  return (window as WindowWithGenericSensors<TSensor>)[constructorName];
};

/** The shape returned by every public Generic Sensor API hook. */
export interface UseGenericSensorResult<TReading> {
  activated: boolean;
  error: DOMException | undefined;
  reading: TReading | undefined;
  start: () => boolean;
  stop: () => void;
  supported: boolean;
}

/**
 * Shared logic (start/stop/reading/error) used by every `useExperimental*Sensor`
 * hook. The `start()` function creates the sensor and calls its
 * `start()`. If creating the sensor fails (for example, a Permissions Policy
 * block) or it fails later (for example, a denied permission), both cases
 * are reported through `error` instead of throwing an exception.
 */
export const useGenericSensor = <TSensor extends GenericSensorInstance, TReading>(
  constructorName: GenericSensorConstructorName,
  readReading: (sensor: TSensor) => TReading,
  options?: GenericSensorOptions,
): UseGenericSensorResult<TReading> => {
  const supported = Boolean(getGenericSensorConstructor<TSensor>(constructorName));
  const [activated, setActivated] = useState(false);
  const [reading, setReading] = useState<TReading | undefined>(undefined);
  const [error, setError] = useState<DOMException | undefined>(undefined);
  const sensorRef = useRef<TSensor | null>(null);
  const frequency = options?.frequency;

  const stop = useCallback(() => {
    sensorRef.current?.stop();
    sensorRef.current = null;
    setActivated(false);
  }, []);

  const start = useCallback((): boolean => {
    const SensorCtor = getGenericSensorConstructor<TSensor>(constructorName);
    if (!SensorCtor) {
      return false;
    }

    stop();
    setError(undefined);

    let sensor: TSensor;
    try {
      sensor = new SensorCtor(frequency === undefined ? undefined : { frequency });
    } catch (caught) {
      setError(caught instanceof DOMException ? caught : undefined);
      return false;
    }

    sensor.onreading = () => {
      setReading(readReading(sensor));
      setActivated(sensor.activated);
    };
    sensor.onerror = (event) => {
      setError(event.error);
      setActivated(false);
    };

    sensorRef.current = sensor;
    sensor.start();
    return true;
  }, [constructorName, frequency, readReading, stop]);

  useEffect(() => () => stop(), [stop]);

  return useMemo(
    () => ({ activated, error, reading, start, stop, supported }),
    [activated, error, reading, start, stop, supported],
  );
};
