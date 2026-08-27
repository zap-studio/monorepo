import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { NetworkInformation } from "./_network.ts";

import { useNetworkState } from "./use-network-state.ts";

const setNavigatorOnLine = (value: boolean) => {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
};

const createConnectionMock = (
  initial: Pick<NetworkInformation, "downlink" | "effectiveType" | "rtt" | "saveData">,
) => {
  const connection: NetworkInformation = new EventTarget();
  let state = { ...initial };

  Object.defineProperties(connection, {
    downlink: { configurable: true, get: () => state.downlink },
    effectiveType: { configurable: true, get: () => state.effectiveType },
    rtt: { configurable: true, get: () => state.rtt },
    saveData: { configurable: true, get: () => state.saveData },
  });

  return {
    connection,
    setState: (next: Partial<typeof state>) => {
      state = { ...state, ...next };
      connection.dispatchEvent(new Event("change"));
    },
  };
};

const setNavigatorConnection = (connection: NetworkInformation | undefined) => {
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    get: () => connection,
  });
};

describe(useNetworkState, () => {
  it("reports online status and connection info", () => {
    setNavigatorOnLine(true);
    const { connection } = createConnectionMock({
      downlink: 10,
      effectiveType: "4g",
      rtt: 50,
      saveData: false,
    });
    setNavigatorConnection(connection);

    const { result } = renderHook(() => useNetworkState());

    expect(result.current).toEqual({
      downlink: 10,
      effectiveType: "4g",
      online: true,
      rtt: 50,
      saveData: false,
    });
  });

  it("updates when the connection changes", async () => {
    setNavigatorOnLine(true);
    const { connection, setState } = createConnectionMock({
      downlink: 10,
      effectiveType: "4g",
      rtt: 50,
      saveData: false,
    });
    setNavigatorConnection(connection);

    const { result } = renderHook(() => useNetworkState());
    expect(result.current.effectiveType).toBe("4g");

    await act(async () => {
      setState({ effectiveType: "2g" });
    });

    expect(result.current.effectiveType).toBe("2g");
  });

  it("leaves connection fields undefined when NetworkInformation is unsupported", () => {
    setNavigatorOnLine(true);
    setNavigatorConnection(undefined);

    const { result } = renderHook(() => useNetworkState());

    expect(result.current).toEqual({
      downlink: undefined,
      effectiveType: undefined,
      online: true,
      rtt: undefined,
      saveData: undefined,
    });
  });
});
