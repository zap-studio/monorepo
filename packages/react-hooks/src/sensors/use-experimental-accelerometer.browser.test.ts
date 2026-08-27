import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalAccelerometer } from "./use-experimental-accelerometer.ts";

const createSensorMock = (reading: { x: number; y: number; z: number }) => {
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

const stubAccelerometer = (sensor?: ReturnType<typeof createSensorMock>["sensor"]) => {
  const AccelerometerCtor = vi
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
    .mockImplementation(function Accelerometer() {
      return sensor;
    });
  vi.stubGlobal("Accelerometer", AccelerometerCtor);
  return AccelerometerCtor;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalAccelerometer", () => {
  it("reports supported: false when the Generic Sensor API is unavailable", () => {
    vi.stubGlobal("Accelerometer", undefined);

    const { result } = renderHook(() => useExperimentalAccelerometer());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
  });

  it("reports supported: true when window.Accelerometer exists", () => {
    stubAccelerometer();

    const { result } = renderHook(() => useExperimentalAccelerometer());

    expect(result.current.supported).toBe(true);
  });

  it("start() returns false without constructing a sensor when unsupported", () => {
    vi.stubGlobal("Accelerometer", undefined);

    const { result } = renderHook(() => useExperimentalAccelerometer());
    let started = false;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
  });

  it("start() catches a construction failure and reports it through error", () => {
    const domException = new DOMException(
      "Permissions Policy blocks Accelerometer",
      "SecurityError",
    );
    const AccelerometerCtor = vi.fn<() => never>().mockImplementation(function Accelerometer() {
      throw domException;
    });
    vi.stubGlobal("Accelerometer", AccelerometerCtor);

    const { result } = renderHook(() => useExperimentalAccelerometer());
    let started = true;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
    expect(result.current.error).toBe(domException);
  });

  it("start() catches a non-DOMException construction failure without reporting error", () => {
    const AccelerometerCtor = vi.fn<() => never>().mockImplementation(function Accelerometer() {
      throw new TypeError("boom");
    });
    vi.stubGlobal("Accelerometer", AccelerometerCtor);

    const { result } = renderHook(() => useExperimentalAccelerometer());
    let started = true;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("start() constructs the sensor with the given frequency", () => {
    const { sensor } = createSensorMock({ x: 1, y: 2, z: 3 });
    const AccelerometerCtor = stubAccelerometer(sensor);

    const { result } = renderHook(() => useExperimentalAccelerometer({ frequency: 60 }));
    act(() => {
      result.current.start();
    });

    expect(AccelerometerCtor).toHaveBeenCalledWith({ frequency: 60 });
  });

  it("start() reports the reading and updates on subsequent readings", () => {
    const { sensor, fireReading } = createSensorMock({ x: 1, y: 2, z: 3 });
    stubAccelerometer(sensor);

    const { result } = renderHook(() => useExperimentalAccelerometer());

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
    stubAccelerometer(sensor);
    const domException = new DOMException("Permission denied", "NotAllowedError");

    const { result } = renderHook(() => useExperimentalAccelerometer());

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
    stubAccelerometer(sensor);

    const { result } = renderHook(() => useExperimentalAccelerometer());

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
