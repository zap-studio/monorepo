import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useExperimentalGravitySensor } from "./use-experimental-gravity-sensor.ts";

const createSensorMock = (reading: { x: number; y: number; z: number }) => {
  const sensor = asTestDouble<
    EventTarget & {
      activated: boolean;
      onerror: ((event: Event & { error: DOMException }) => void) | null;
      onreading: ((event: Event) => void) | null;
      start: () => void;
      stop: () => void;
      x: number;
      y: number;
      z: number;
    }
  >(new EventTarget());
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

const stubGravitySensor = (sensor?: ReturnType<typeof createSensorMock>["sensor"]) => {
  const GravitySensorCtor = vi
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
    .mockImplementation(function GravitySensor() {
      return sensor;
    });
  vi.stubGlobal("GravitySensor", GravitySensorCtor);
  return GravitySensorCtor;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalGravitySensor", () => {
  it("reports supported: false when the Generic Sensor API is unavailable", () => {
    vi.stubGlobal("GravitySensor", undefined);

    const { result } = renderHook(() => useExperimentalGravitySensor());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
  });

  it("reports supported: true when window.GravitySensor exists", () => {
    stubGravitySensor();

    const { result } = renderHook(() => useExperimentalGravitySensor());

    expect(result.current.supported).toBe(true);
  });

  it("start() returns false without constructing a sensor when unsupported", () => {
    vi.stubGlobal("GravitySensor", undefined);

    const { result } = renderHook(() => useExperimentalGravitySensor());
    let started = false;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
  });

  it("start() reports the reading and updates on subsequent readings", () => {
    const { sensor, fireReading } = createSensorMock({ x: 0, y: 9.8, z: 0 });
    stubGravitySensor(sensor);

    const { result } = renderHook(() => useExperimentalGravitySensor());

    act(() => {
      result.current.start();
    });

    expect(result.current.reading).toEqual({ x: 0, y: 9.8, z: 0 });
    expect(result.current.activated).toBe(true);

    act(() => {
      fireReading({ x: 1, y: 9.7, z: 0.2 });
    });

    expect(result.current.reading).toEqual({ x: 1, y: 9.7, z: 0.2 });
  });

  it("reports a permission/policy failure through error", () => {
    const { sensor, fireError } = createSensorMock({ x: 0, y: 0, z: 0 });
    stubGravitySensor(sensor);
    const domException = new DOMException("Permission denied", "NotAllowedError");

    const { result } = renderHook(() => useExperimentalGravitySensor());

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
    const { sensor } = createSensorMock({ x: 0, y: 9.8, z: 0 });
    stubGravitySensor(sensor);

    const { result } = renderHook(() => useExperimentalGravitySensor());

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
