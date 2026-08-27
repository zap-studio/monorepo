import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalAbsoluteOrientationSensor } from "./use-experimental-absolute-orientation-sensor.ts";

const createSensorMock = (quaternion: [number, number, number, number]) => {
  // SAFETY: the assignments right below set every field of the intersection type (activated, quaternion, onerror, onreading, start, stop), so this EventTarget really does satisfy the AbsoluteOrientationSensor-shaped mock by the time any test reads from it.
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
    fireReading: (next: [number, number, number, number]) => {
      sensor.quaternion = next;
      sensor.onreading?.(new Event("reading"));
    },
    sensor,
  };
};

const stubAbsoluteOrientationSensor = (sensor?: ReturnType<typeof createSensorMock>["sensor"]) => {
  const AbsoluteOrientationSensorCtor = vi
    .fn<
      () =>
        | (EventTarget & {
            activated: boolean;
            onerror: ((event: Event & { error: DOMException }) => void) | null;
            onreading: ((event: Event) => void) | null;
            quaternion: [number, number, number, number];
            start: () => void;
            stop: () => void;
          })
        | undefined
    >()
    .mockImplementation(function AbsoluteOrientationSensor() {
      return sensor;
    });
  vi.stubGlobal("AbsoluteOrientationSensor", AbsoluteOrientationSensorCtor);
  return AbsoluteOrientationSensorCtor;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalAbsoluteOrientationSensor", () => {
  it("reports supported: false when the Generic Sensor API is unavailable", () => {
    vi.stubGlobal("AbsoluteOrientationSensor", undefined);

    const { result } = renderHook(() => useExperimentalAbsoluteOrientationSensor());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
  });

  it("reports supported: true when window.AbsoluteOrientationSensor exists", () => {
    stubAbsoluteOrientationSensor();

    const { result } = renderHook(() => useExperimentalAbsoluteOrientationSensor());

    expect(result.current.supported).toBe(true);
  });

  it("start() returns false without constructing a sensor when unsupported", () => {
    vi.stubGlobal("AbsoluteOrientationSensor", undefined);

    const { result } = renderHook(() => useExperimentalAbsoluteOrientationSensor());
    let started = false;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
  });

  it("start() reports the reading and updates on subsequent readings", () => {
    const { sensor, fireReading } = createSensorMock([0, 0, 0, 1]);
    stubAbsoluteOrientationSensor(sensor);

    const { result } = renderHook(() => useExperimentalAbsoluteOrientationSensor());

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
    stubAbsoluteOrientationSensor(sensor);
    const domException = new DOMException("Permission denied", "NotAllowedError");

    const { result } = renderHook(() => useExperimentalAbsoluteOrientationSensor());

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
    stubAbsoluteOrientationSensor(sensor);

    const { result } = renderHook(() => useExperimentalAbsoluteOrientationSensor());

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
