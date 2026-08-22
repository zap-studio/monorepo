import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDeviceMotion } from "./use-device-motion.ts";

describe(useDeviceMotion, () => {
  it("starts with all-null motion and supported reflecting DeviceMotionEvent", () => {
    const { result } = renderHook(() => useDeviceMotion());

    expect(result.current.acceleration).toBeNull();
    expect(result.current.accelerationIncludingGravity).toBeNull();
    expect(result.current.rotationRate).toBeNull();
    expect(result.current.interval).toBe(0);
    expect(result.current.supported).toBe(typeof DeviceMotionEvent !== "undefined");
  });

  it("updates when a devicemotion event fires", async () => {
    const { result } = renderHook(() => useDeviceMotion());

    await act(async () => {
      window.dispatchEvent(
        new DeviceMotionEvent("devicemotion", {
          acceleration: { x: 1, y: 2, z: 3 },
          interval: 16,
        }),
      );
    });

    expect(result.current.acceleration?.x).toBe(1);
    expect(result.current.acceleration?.y).toBe(2);
    expect(result.current.acceleration?.z).toBe(3);
    expect(result.current.interval).toBe(16);
  });

  it("resolves true from requestPermission when no permission gate exists", async () => {
    const { result } = renderHook(() => useDeviceMotion());

    await expect(result.current.requestPermission()).resolves.toBe(true);
  });

  it("resolves according to the iOS permission gate when present", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    Object.defineProperty(DeviceMotionEvent, "requestPermission", {
      configurable: true,
      value: requestPermission,
    });

    const { result } = renderHook(() => useDeviceMotion());

    await expect(result.current.requestPermission()).resolves.toBe(true);
    expect(requestPermission).toHaveBeenCalledTimes(1);

    Reflect.deleteProperty(DeviceMotionEvent, "requestPermission");
  });

  it("reports supported: false when DeviceMotionEvent is unavailable", () => {
    const original = window.DeviceMotionEvent;
    Object.defineProperty(window, "DeviceMotionEvent", { configurable: true, value: undefined });

    const { result } = renderHook(() => useDeviceMotion());

    expect(result.current.supported).toBe(false);

    Object.defineProperty(window, "DeviceMotionEvent", { configurable: true, value: original });
  });
});
