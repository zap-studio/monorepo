import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalGyroscope } from "./use-experimental-gyroscope.ts";

const createSensorMock = (reading: { x: number; y: number; z: number }) => {
  // SAFETY: the lines right below set every field of the intersection type (activated, onerror, onreading, start, stop, x, y, z), so this EventTarget really is a full Gyroscope-shaped mock before any test reads it.
  const sensor = new EventTarget() as EventTarget & {
    activated: boolean;
    onerror: ((event: Event & { error: DOMException }) => void) | null;
    onreading: ((event: Event) => void) | null;
    start: () => void;
    stop: () => void;
    x: number;
    y: number;
    z: number;
  };
  sensor.activated = false;
  sensor.x = reading.x;
  sensor.y = reading.y;
  sensor.z = reading.z;
  sensor.onreading = null;
  sensor.onerror = null;
  sensor.start = vi.fn<() => void>(() => {
    sensor.activated = true;
    sensor.onreading?.(new Event("reading"));
  });
  sensor.stop = vi.fn<() => void>(() => {
    sensor.activated = false;
  });

  return {
    fireError: (error: DOMException) => {
      sensor.onerror?.(Object.assign(new Event("error"), { error }));
    },
    fireReading: (next: { x: number; y: number; z: number }) => {
      sensor.x = next.x;
      sensor.y = next.y;
      sensor.z = next.z;
      sensor.onreading?.(new Event("reading"));
    },
    sensor,
  };
};

const stubGyroscope = (sensor?: ReturnType<typeof createSensorMock>["sensor"]) => {
  const GyroscopeCtor = vi
    .fn<
      () =>
        | (EventTarget & {
            activated: boolean;
            onerror: ((event: Event & { error: DOMException }) => void) | null;
            onreading: ((event: Event) => void) | null;
            start: () => void;
            stop: () => void;
            x: number;
            y: number;
            z: number;
          })
        | undefined
    >()
    .mockImplementation(function Gyroscope() {
      return sensor;
    });
  vi.stubGlobal("Gyroscope", GyroscopeCtor);
  return GyroscopeCtor;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalGyroscope", () => {
  it("reports supported: false when the Generic Sensor API is unavailable", () => {
    vi.stubGlobal("Gyroscope", undefined);

    const { result } = renderHook(() => useExperimentalGyroscope());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
  });

  it("reports supported: true when window.Gyroscope exists", () => {
    stubGyroscope();

    const { result } = renderHook(() => useExperimentalGyroscope());

    expect(result.current.supported).toBe(true);
  });

  it("start() returns false without constructing a sensor when unsupported", () => {
    vi.stubGlobal("Gyroscope", undefined);

    const { result } = renderHook(() => useExperimentalGyroscope());
    let started = false;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
  });

  it("start() reports the reading and updates on subsequent readings", () => {
    const { sensor, fireReading } = createSensorMock({ x: 1, y: 2, z: 3 });
    stubGyroscope(sensor);

    const { result } = renderHook(() => useExperimentalGyroscope());

    act(() => {
      result.current.start();
    });

    expect(result.current.reading).toEqual({ x: 1, y: 2, z: 3 });
    expect(result.current.activated).toBe(true);

    act(() => {
      fireReading({ x: 4, y: 5, z: 6 });
    });

    expect(result.current.reading).toEqual({ x: 4, y: 5, z: 6 });
  });

  it("reports a permission/policy failure through error", () => {
    const { sensor, fireError } = createSensorMock({ x: 0, y: 0, z: 0 });
    stubGyroscope(sensor);
    const domException = new DOMException("Permission denied", "NotAllowedError");

    const { result } = renderHook(() => useExperimentalGyroscope());

    act(() => {
      result.current.start();
    });
    act(() => {
      fireError(domException);
    });

    expect(result.current.error).toBe(domException);
    expect(result.current.activated).toBe(false);
  });

  it("stop() stops the sensor and resets activated", () => {
    const { sensor } = createSensorMock({ x: 1, y: 2, z: 3 });
    stubGyroscope(sensor);

    const { result } = renderHook(() => useExperimentalGyroscope());

    act(() => {
      result.current.start();
    });
    expect(result.current.activated).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(result.current.activated).toBe(false);
    expect(sensor.stop).toHaveBeenCalled();
  });
});
