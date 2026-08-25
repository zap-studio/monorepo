import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalAmbientLightSensor } from "./use-experimental-ambient-light-sensor.ts";

function createSensorMock(reading: { illuminance: number }) {
  const sensor = new EventTarget() as EventTarget & {
    activated: boolean;
    illuminance: number;
    onerror: ((event: Event & { error: DOMException }) => void) | null;
    onreading: ((event: Event) => void) | null;
    start: () => void;
    stop: () => void;
  };
  sensor.activated = false;
  sensor.illuminance = reading.illuminance;
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
    fireReading: (next: { illuminance: number }) => {
      sensor.illuminance = next.illuminance;
      sensor.onreading?.(new Event("reading"));
    },
    sensor,
  };
}

function stubAmbientLightSensor(sensor?: ReturnType<typeof createSensorMock>["sensor"]) {
  const AmbientLightSensorCtor = vi.fn().mockImplementation(function AmbientLightSensor() {
    return sensor;
  });
  vi.stubGlobal("AmbientLightSensor", AmbientLightSensorCtor);
  return AmbientLightSensorCtor;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useExperimentalAmbientLightSensor, () => {
  it("reports supported: false when the Generic Sensor API is unavailable", () => {
    vi.stubGlobal("AmbientLightSensor", undefined);

    const { result } = renderHook(() => useExperimentalAmbientLightSensor());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
  });

  it("reports supported: true when window.AmbientLightSensor exists", () => {
    stubAmbientLightSensor();

    const { result } = renderHook(() => useExperimentalAmbientLightSensor());

    expect(result.current.supported).toBe(true);
  });

  it("start() returns false without constructing a sensor when unsupported", () => {
    vi.stubGlobal("AmbientLightSensor", undefined);

    const { result } = renderHook(() => useExperimentalAmbientLightSensor());
    let started = false;
    act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
  });

  it("start() reports the reading and updates on subsequent readings", () => {
    const { sensor, fireReading } = createSensorMock({ illuminance: 300 });
    stubAmbientLightSensor(sensor);

    const { result } = renderHook(() => useExperimentalAmbientLightSensor());

    act(() => {
      result.current.start();
    });

    expect(result.current.reading).toEqual({ illuminance: 300 });
    expect(result.current.activated).toBe(true);

    act(() => {
      fireReading({ illuminance: 450 });
    });

    expect(result.current.reading).toEqual({ illuminance: 450 });
  });

  it("reports a permission/policy failure through error", () => {
    const { sensor, fireError } = createSensorMock({ illuminance: 0 });
    stubAmbientLightSensor(sensor);
    const domException = new DOMException("Permission denied", "NotAllowedError");

    const { result } = renderHook(() => useExperimentalAmbientLightSensor());

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
    const { sensor } = createSensorMock({ illuminance: 300 });
    stubAmbientLightSensor(sensor);

    const { result } = renderHook(() => useExperimentalAmbientLightSensor());

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
