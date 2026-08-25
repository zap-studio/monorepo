import { useEffect, useState } from "react";

/** Minimal shape of the Battery Status API's `BatteryManager`, as used by `useBattery`. */
export interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

/** The shape returned by `useBattery`. */
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
 *
 * @example
 * ```tsx
 * const { supported, level, charging } = useBattery();
 * ```
 */
export const useBattery = (): BatteryState => {
  const [state, setState] = useState<BatteryState>(UNSUPPORTED_STATE);

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- the returned cleanup does call the `cleanup` closure variable, which removes every listener added in `subscribeToBattery`; the detector's cleanup matcher misses it because the removeEventListener calls sit behind that indirection instead of literally inline in the returned function.
  useEffect(() => {
    // SAFETY: getBattery is an experimental, largely Chromium-only API not declared in TypeScript's DOM lib; guarded by the `if (!getBattery)` check below, so an unsupported browser degrades to the SSR default instead of throwing.
    const getBattery = (navigator as NavigatorWithBattery).getBattery;
    if (!getBattery) {
      return undefined;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const subscribeToBattery = async () => {
      const battery = await getBattery.call(navigator);
      if (cancelled) {
        return;
      }
      setState(readBatteryState(battery));

      const handleChange = () => {
        setState(readBatteryState(battery));
      };

      battery.addEventListener("chargingchange", handleChange);
      battery.addEventListener("chargingtimechange", handleChange);
      battery.addEventListener("dischargingtimechange", handleChange);
      battery.addEventListener("levelchange", handleChange);

      cleanup = () => {
        battery.removeEventListener("chargingchange", handleChange);
        battery.removeEventListener("chargingtimechange", handleChange);
        battery.removeEventListener("dischargingtimechange", handleChange);
        battery.removeEventListener("levelchange", handleChange);
      };
    };

    void subscribeToBattery();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return state;
};
