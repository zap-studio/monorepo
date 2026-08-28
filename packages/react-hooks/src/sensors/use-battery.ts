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
 * Wraps the Battery Status API (`navigator.getBattery()`). Only Chromium
 * browsers support this API; most other browsers removed it. Returns
 * `{ supported: false }` (the safe default for server rendering) until the
 * browser confirms `getBattery` exists and returns a result.
 *
 * @example
 * ```tsx
 * const { supported, level, charging } = useBattery();
 * ```
 */
export const useBattery = (): BatteryState => {
  const [state, setState] = useState<BatteryState>(UNSUPPORTED_STATE);
  const [battery, setBattery] = useState<BatteryManager | undefined>(undefined);

  useEffect(() => {
    // SAFETY: getBattery isn't declared on Navigator. The `if (!getBattery)` check below handles browsers that don't support it, so the code uses the SSR default instead of crashing.
    const getBattery = (navigator as NavigatorWithBattery).getBattery;
    if (!getBattery) {
      return undefined;
    }

    let isMounted = true;

    void (async () => {
      const result = await getBattery.call(navigator);
      if (!isMounted) {
        return;
      }
      setBattery(result);
      setState(readBatteryState(result));
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!battery) {
      return undefined;
    }

    const handleChange = () => {
      setState(readBatteryState(battery));
    };

    battery.addEventListener("chargingchange", handleChange);
    battery.addEventListener("chargingtimechange", handleChange);
    battery.addEventListener("dischargingtimechange", handleChange);
    battery.addEventListener("levelchange", handleChange);

    return () => {
      battery.removeEventListener("chargingchange", handleChange);
      battery.removeEventListener("chargingtimechange", handleChange);
      battery.removeEventListener("dischargingtimechange", handleChange);
      battery.removeEventListener("levelchange", handleChange);
    };
  }, [battery]);

  return state;
};
