import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BatteryManager } from "./use-battery.ts";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useBattery } from "./use-battery.ts";

const createBatteryMock = (
  initial: Pick<BatteryManager, "charging" | "chargingTime" | "dischargingTime" | "level">,
) => {
  // SAFETY: the hook only calls addEventListener/removeEventListener, which come from
  // EventTarget, and reads charging/chargingTime/dischargingTime/level, which are all
  // defined with Object.defineProperties below.
  const battery = asTestDouble<BatteryManager>(new EventTarget());
  let state = { ...initial };

  Object.defineProperties(battery, {
    charging: { configurable: true, get: () => state.charging },
    chargingTime: { configurable: true, get: () => state.chargingTime },
    dischargingTime: { configurable: true, get: () => state.dischargingTime },
    level: { configurable: true, get: () => state.level },
  });

  return {
    battery,
    setState: (next: Partial<typeof state>) => {
      state = { ...state, ...next };
      battery.dispatchEvent(new Event("levelchange"));
    },
  };
};

const setNavigatorGetBattery = (getBattery: (() => Promise<BatteryManager>) | undefined) => {
  Object.defineProperty(navigator, "getBattery", {
    configurable: true,
    value: getBattery,
  });
};

describe("useBattery", () => {
  it("reports unsupported when the Battery Status API is unavailable", () => {
    setNavigatorGetBattery(undefined);

    const { result } = renderHook(() => useBattery());

    expect(result.current).toEqual({ supported: false });
  });

  it("reports battery state once getBattery resolves", async () => {
    const { battery } = createBatteryMock({
      charging: true,
      chargingTime: 0,
      dischargingTime: Infinity,
      level: 0.8,
    });
    setNavigatorGetBattery(() => Promise.resolve(battery));

    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current).toEqual({
        charging: true,
        chargingTime: 0,
        dischargingTime: Infinity,
        level: 0.8,
        supported: true,
      });
    });
  });

  it("updates when the battery reports a change", async () => {
    const { battery, setState } = createBatteryMock({
      charging: true,
      chargingTime: 0,
      dischargingTime: Infinity,
      level: 0.8,
    });
    setNavigatorGetBattery(() => Promise.resolve(battery));

    const { result } = renderHook(() => useBattery());
    await waitFor(() => expect(result.current.supported).toBe(true));

    await act(async () => {
      setState({ level: 0.5 });
    });

    expect(result.current.level).toBe(0.5);
  });

  it("ignores a resolved battery if the component unmounted first", async () => {
    let resolveBattery!: (battery: BatteryManager) => void;
    const batteryPromise = new Promise<BatteryManager>((resolve) => {
      resolveBattery = resolve;
    });
    setNavigatorGetBattery(() => batteryPromise);

    const { unmount } = renderHook(() => useBattery());
    unmount();

    const { battery } = createBatteryMock({
      charging: false,
      chargingTime: Infinity,
      dischargingTime: 100,
      level: 0.3,
    });
    const addEventListener = vi.spyOn(battery, "addEventListener");

    await act(async () => {
      resolveBattery(battery);
      await batteryPromise;
    });

    expect(addEventListener).not.toHaveBeenCalled();
  });
});
