import { useCallback, useEffect, useRef, useState } from "react";

/** A small copy of the Generic Sensor API's types. This is an experimental API, only in Chrome, and not included in TypeScript's built-in types. */
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

interface GenericSensorWindow {
  [constructorName: string]: unknown;
}

/**
 * Checks `typeof window === "undefined"`. Every sensor hook reads this
 * directly in the hook body on every render, including server-side
 * rendering, not only inside an effect.
 */
const getGenericSensorConstructor = <TSensor extends GenericSensorInstance>(
  constructorName: string,
): GenericSensorConstructor<TSensor> | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window is first treated as `unknown`, then read as a record keyed by string. Not every TypeScript DOM lib declares these sensor constructors, so on a browser that truly lacks one (like Safari or Firefox) this reads as undefined instead of throwing.
  const untypedWindow: unknown = window;
  // SAFETY: the sensor constructor is read by name from the widened window above. Callers only ever pass a known Generic Sensor API constructor name.
  const sensorWindow = untypedWindow as GenericSensorWindow;
  // SAFETY: the value read above is cast from `unknown` to a constructor type. Every caller in this file passes one of the fixed Generic Sensor API constructor names, so this is always that constructor or undefined.
  return sensorWindow[constructorName] as GenericSensorConstructor<TSensor> | undefined;
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
  constructorName: string,
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

  return { activated, error, reading, start, stop, supported };
};
