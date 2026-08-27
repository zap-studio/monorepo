import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalRelativeOrientationSensor } from "./use-experimental-relative-orientation-sensor.ts";

const createSensorMock = (quaternion: [number, number, number, number]) => {
  const sensor = new EventTarget() as EventTarget & {
    activated: boolean;
    onerror: ((event: Event & { error: DOMException }) => void) | null;
    onreading: ((event: Event) => void) | null;
    quaternion: [number, number, number, number];
    start: () => void;
    stop: () => void;
  };
  sensor.activated = false;
  sensor.quaternion = quaternion;
  sensor.onreading = null;
  sensor.onerror = null;
  sensor.start = vi.fn(() => {
    sensor.activated = true;
    sensor.onreading?.(new Event("reading"));
  });
  sensor.stop = vi.fn(() => {
    sensor.activated = false;
  });

  return {
    fireError: (error: DOMException) => {
      sensor.onerror?.(Object.assign(new Event("error"), { error }));
    },
    fireReading: (next: [number, number, number, number]) => {
      sensor.quaternion = next;
      sensor.onreading?.(new Event("reading"));
    },
    sensor,
  };
};

const stubRelativeOrientationSensor = (sensor?: ReturnType<typeof createSensorMock>["sensor"]) => {
  const RelativeOrientationSensorCtor = vi
    .fn()
    .mockImplementation(function RelativeOrientationSensor() {
      return sensor;
    });
  vi.stubGlobal("RelativeOrientationSensor", RelativeOrientationSensorCtor);
  return RelativeOrientationSensorCtor;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalRelativeOrientationSensor", () => {
  it("reports supported: false when the Generic Sensor API is unavailable", () => {
    vi.stubGlobal("RelativeOrientationSensor", undefined);

    const { result } = renderHook(() => useExperimentalRelativeOrientationSensor());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
  });

  it("reports supported: true when window.RelativeOrientationSensor exists", () => {
    stubRelativeOrientationSensor();

    const { result } = renderHook(() => useExperimentalRelativeOrientationSensor());

    expect(result.current.supported).toBe(true);
  });

  it("start() returns false without constructing a sensor when unsupported", () => {
    vi.stubGlobal("RelativeOrientationSensor", undefined);

    const { result } = renderHook(() => useExperimentalRelativeOrientationSensor());
    let started = false;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
  });

  it("start() reports the reading and updates on subsequent readings", () => {
    const { sensor, fireReading } = createSensorMock([0, 0, 0, 1]);
    stubRelativeOrientationSensor(sensor);

    const { result } = renderHook(() => useExperimentalRelativeOrientationSensor());

    act(() => {
      result.current.start();
    });

    expect(result.current.reading).toEqual({ quaternion: [0, 0, 0, 1] });
    expect(result.current.activated).toBe(true);

    act(() => {
      fireReading([0.1, 0.2, 0.3, 0.9]);
    });

    expect(result.current.reading).toEqual({ quaternion: [0.1, 0.2, 0.3, 0.9] });
  });

  it("reports a permission/policy failure through error", () => {
    const { sensor, fireError } = createSensorMock([0, 0, 0, 1]);
    stubRelativeOrientationSensor(sensor);
    const domException = new DOMException("Permission denied", "NotAllowedError");

    const { result } = renderHook(() => useExperimentalRelativeOrientationSensor());

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
    const { sensor } = createSensorMock([0, 0, 0, 1]);
    stubRelativeOrientationSensor(sensor);

    const { result } = renderHook(() => useExperimentalRelativeOrientationSensor());

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
