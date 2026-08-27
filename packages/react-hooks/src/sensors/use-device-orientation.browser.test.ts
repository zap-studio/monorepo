import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDeviceOrientation } from "./use-device-orientation.ts";

describe("useDeviceOrientation", () => {
  it("starts with all-null orientation and supported reflecting DeviceOrientationEvent", () => {
    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.alpha).toBeNull();
    expect(result.current.beta).toBeNull();
    expect(result.current.gamma).toBeNull();
    expect(result.current.absolute).toBe(false);
    expect(result.current.supported).toBe(typeof DeviceOrientationEvent !== "undefined");
  });

  it("updates when a deviceorientation event fires", async () => {
    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", {
          absolute: true,
          alpha: 10,
          beta: 20,
          gamma: 30,
        }),
      );
    });

    expect(result.current).toEqual({
      absolute: true,
      alpha: 10,
      beta: 20,
      gamma: 30,
      requestPermission: expect.any(Function),
      supported: true,
    });
  });

  it("updates on a deviceorientationabsolute event too", async () => {
    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientationabsolute", {
          absolute: true,
          alpha: 1,
          beta: 2,
          gamma: 3,
        }),
      );
    });

    expect(result.current.alpha).toBe(1);
  });

  it("resolves true from requestPermission when no permission gate exists", async () => {
    const { result } = renderHook(() => useDeviceOrientation());

    await expect(result.current.requestPermission()).resolves.toBe(true);
  });

  it("resolves according to the iOS permission gate when present", async () => {
    const requestPermission = vi.fn<() => Promise<"denied">>().mockResolvedValue("denied");
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      configurable: true,
      value: requestPermission,
    });

    const { result } = renderHook(() => useDeviceOrientation());

    await expect(result.current.requestPermission()).resolves.toBe(false);
    expect(requestPermission).toHaveBeenCalledTimes(1);

    Reflect.deleteProperty(DeviceOrientationEvent, "requestPermission");
  });

  it("reports supported: false when DeviceOrientationEvent is unavailable", () => {
    const original = window.DeviceOrientationEvent;
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.supported).toBe(false);

    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: original,
    });
  });
});
