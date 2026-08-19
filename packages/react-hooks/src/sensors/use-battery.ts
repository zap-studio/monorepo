import { useEffect, useState } from "react";

export interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface BatteryState {
  charging?: boolean;
  chargingTime?: number;
  dischargingTime?: number;
  level?: number;
  supported: boolean;
}

const UNSUPPORTED_STATE: BatteryState = { supported: false };

const readBatteryState = (battery: BatteryManager): BatteryState => ({
  charging: battery.charging,
  chargingTime: battery.chargingTime,
  dischargingTime: battery.dischargingTime,
  level: battery.level,
  supported: true,
});

/**
 * Wraps the Battery Status API (`navigator.getBattery()`) — Chromium-only,
 * removed from most other browsers. `{ supported: false }` — the SSR-safe
 * default — until the client confirms `getBattery` exists and resolves it.
 */
export const useBattery = (): BatteryState => {
  const [state, setState] = useState<BatteryState>(UNSUPPORTED_STATE);

  useEffect(() => {
    // SAFETY: getBattery is an experimental, largely Chromium-only API not declared in TypeScript's DOM lib; guarded by the `if (!getBattery)` check below, so an unsupported browser degrades to the SSR default instead of throwing.
    const getBattery = (navigator as NavigatorWithBattery).getBattery;
    if (!getBattery) {
      return undefined;
    }

    let battery: BatteryManager | undefined;
    let cancelled = false;

    const handleChange = () => {
      if (battery) {
        setState(readBatteryState(battery));
      }
    };

    const subscribeToBattery = async () => {
      const result = await getBattery.call(navigator);
      if (cancelled) {
        return;
      }
      battery = result;
      setState(readBatteryState(battery));
      battery.addEventListener("chargingchange", handleChange);
      battery.addEventListener("chargingtimechange", handleChange);
      battery.addEventListener("dischargingtimechange", handleChange);
      battery.addEventListener("levelchange", handleChange);
    };

    void subscribeToBattery();

    return () => {
      cancelled = true;
      battery?.removeEventListener("chargingchange", handleChange);
      battery?.removeEventListener("chargingtimechange", handleChange);
      battery?.removeEventListener("dischargingtimechange", handleChange);
      battery?.removeEventListener("levelchange", handleChange);
    };
  }, []);

  return state;
};
