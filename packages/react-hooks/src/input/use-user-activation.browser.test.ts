import { afterEach, describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useUserActivation } from "./use-user-activation.ts";

const setUserActivation = (
  activation: { hasBeenActive: boolean; isActive: boolean } | undefined,
) => {
  Object.defineProperty(navigator, "userActivation", {
    configurable: true,
    value: activation,
  });
};

afterEach(() => {
  setUserActivation(undefined);
});

describe("useUserActivation", () => {
  it("reflects the initial navigator.userActivation state", async () => {
    setUserActivation({ hasBeenActive: false, isActive: false });

    const { result } = await renderHook(() => useUserActivation());

    expect(result.current).toEqual({ hasBeenActive: false, isActive: false });
  });

  it("updates after a pointerdown gesture", async () => {
    const activation = { hasBeenActive: false, isActive: false };
    setUserActivation(activation);

    const { result } = await renderHook(() => useUserActivation());

    await act(async () => {
      activation.hasBeenActive = true;
      activation.isActive = true;
      window.dispatchEvent(new Event("pointerdown"));
    });

    expect(result.current).toEqual({ hasBeenActive: true, isActive: true });
  });

  it("updates after a keydown gesture", async () => {
    const activation = { hasBeenActive: false, isActive: false };
    setUserActivation(activation);

    const { result } = await renderHook(() => useUserActivation());

    await act(async () => {
      activation.hasBeenActive = true;
      activation.isActive = true;
      window.dispatchEvent(new Event("keydown"));
    });

    expect(result.current).toEqual({ hasBeenActive: true, isActive: true });
  });

  it("falls back to hasBeenActive: false, isActive: false when unsupported", async () => {
    setUserActivation(undefined);

    const { result } = await renderHook(() => useUserActivation());

    expect(result.current).toEqual({ hasBeenActive: false, isActive: false });
  });

  it("unsubscribes on unmount", async () => {
    const activation = { hasBeenActive: false, isActive: false };
    setUserActivation(activation);

    const { result, unmount } = await renderHook(() => useUserActivation());
    await unmount();

    await act(async () => {
      activation.hasBeenActive = true;
      activation.isActive = true;
      window.dispatchEvent(new Event("pointerdown"));
    });

    expect(result.current).toEqual({ hasBeenActive: false, isActive: false });
  });
});
