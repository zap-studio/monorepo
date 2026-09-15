import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { useExperimentalRelativeOrientationSensor } from "./use-experimental-relative-orientation-sensor.ts";

const createSensorMock = (quaternion: [number, number, number, number]) => {
  const sensor = asTestDouble<
    EventTarget & {
      activated: boolean;
      onerror: ((event: Event & { error: DOMException }) => void) | null;
      onreading: ((event: Event) => void) | null;
      quaternion: [number, number, number, number];
      start: () => void;
      stop: () => void;
    }
  >(new EventTarget());
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

const stubRelativeOrientationSensor = (sensor?: ReturnType<typeof createSensorMock>["sensor"]) => {
  const RelativeOrientationSensorCtor = vi
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
  it("reports supported: false when the Generic Sensor API is unavailable", async () => {
    vi.stubGlobal("RelativeOrientationSensor", undefined);

    const { result } = await renderHook(() => useExperimentalRelativeOrientationSensor());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
  });

  it("reports supported: true when window.RelativeOrientationSensor exists", async () => {
    stubRelativeOrientationSensor();

    const { result } = await renderHook(() => useExperimentalRelativeOrientationSensor());

    expect(result.current.supported).toBe(true);
  });

  it("start() returns false without constructing a sensor when unsupported", async () => {
    vi.stubGlobal("RelativeOrientationSensor", undefined);

    const { result } = await renderHook(() => useExperimentalRelativeOrientationSensor());
    let started = false;
    await act(() => {
      started = result.current.start();
    });

    expect(started).toBe(false);
  });

  it("start() reports the reading and updates on subsequent readings", async () => {
    const { sensor, fireReading } = createSensorMock([0, 0, 0, 1]);
    stubRelativeOrientationSensor(sensor);

    const { result } = await renderHook(() => useExperimentalRelativeOrientationSensor());

    await act(() => {
      result.current.start();
    });

    expect(result.current.reading).toEqual({ quaternion: [0, 0, 0, 1] });
    expect(result.current.activated).toBe(true);

    await act(() => {
      fireReading([0.1, 0.2, 0.3, 0.9]);
    });

    expect(result.current.reading).toEqual({ quaternion: [0.1, 0.2, 0.3, 0.9] });
  });

  it("reports a permission/policy failure through error", async () => {
    const { sensor, fireError } = createSensorMock([0, 0, 0, 1]);
    stubRelativeOrientationSensor(sensor);
    const domException = new DOMException("Permission denied", "NotAllowedError");

    const { result } = await renderHook(() => useExperimentalRelativeOrientationSensor());

    await act(() => {
      result.current.start();
    });
    await act(() => {
      fireError(domException);
    });

    expect(result.current.error).toBe(domException);
    expect(result.current.activated).toBe(false);
  });

  it("stop() stops the sensor and resets activated", async () => {
    const { sensor } = createSensorMock([0, 0, 0, 1]);
    stubRelativeOrientationSensor(sensor);

    const { result } = await renderHook(() => useExperimentalRelativeOrientationSensor());

    await act(() => {
      result.current.start();
    });
    expect(result.current.activated).toBe(true);

    await act(() => {
      result.current.stop();
    });

    expect(result.current.activated).toBe(false);
    expect(sensor.stop).toHaveBeenCalled();
  });
});
