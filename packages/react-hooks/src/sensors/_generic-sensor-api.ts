import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal local model of the Generic Sensor API — Experimental per MDN, Chromium-only, not declared in every TypeScript DOM lib. */
export interface GenericSensorErrorEvent extends Event {
  readonly error: DOMException;
}

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
 * Guards `typeof window === "undefined"` because every sensor hook reads
 * this synchronously in the hook body, on every render including SSR — not
 * just from an effect.
 */
export const getGenericSensorConstructor = <TSensor extends GenericSensorInstance>(
  constructorName: string,
): GenericSensorConstructor<TSensor> | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window is widened to `unknown` first, then read as a string-keyed record — none of these sensor constructors are declared on every TypeScript DOM lib, so a browser where a given one is genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  const untypedWindow: unknown = window;
  // SAFETY: the sensor constructor is read by name off the widened window above; callers only ever pass a known Generic Sensor API constructor name.
  const sensorWindow = untypedWindow as GenericSensorWindow;
  // SAFETY: the property read above is `unknown` widened back to a constructor type; every caller in this file passes one of the fixed Generic Sensor API constructor names, so this only ever holds that constructor or undefined.
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
 * Shared `Sensor` subclass lifecycle (start/stop/reading/error) behind every
 * `useExperimental*Sensor` hook. Not itself a public hook — hook files never
 * import one another, so shared logic lives here (mirrors `_network.ts`'s
 * `useNetworkSnapshot` convention). `start()` constructs the sensor and
 * calls its `start()`; construction failures (e.g. a Permissions Policy
 * block) and later runtime failures (e.g. a denied permission prompt) both
 * surface through `error` rather than a thrown exception.
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
