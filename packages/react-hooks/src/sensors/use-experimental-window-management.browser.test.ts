import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalWindowManagement } from "./use-experimental-window-management.ts";

const BUILT_IN_DISPLAY_LABEL = "Built-in Display";
const EXTERNAL_DISPLAY_LABEL = "External Display";

const stubIsExtended = (isExtended: boolean) => {
  Object.defineProperty(window.screen, "isExtended", { configurable: true, value: isExtended });
};

class MockScreenDetails extends EventTarget {
  currentScreen: unknown;
  screens: unknown[];

  constructor(screens: unknown[], currentScreen: unknown) {
    super();
    this.screens = screens;
    this.currentScreen = currentScreen;
  }
}

const stubGetScreenDetails = (details: MockScreenDetails | (() => Promise<MockScreenDetails>)) => {
  const getScreenDetails =
    typeof details === "function" ? details : vi.fn(() => Promise.resolve(details));
  vi.stubGlobal("getScreenDetails", getScreenDetails);
  return getScreenDetails;
};

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window.screen, "isExtended");
});

describe(useExperimentalWindowManagement, () => {
  it("reports supported: false when getScreenDetails is unavailable", () => {
    vi.stubGlobal("getScreenDetails", undefined);

    const { result } = renderHook(() => useExperimentalWindowManagement());

    expect(result.current.supported).toBe(false);
    expect(result.current.screens).toEqual([]);
    expect(result.current.currentScreen).toBeUndefined();
  });

  it("resolves false from requestPermission when unsupported", async () => {
    vi.stubGlobal("getScreenDetails", undefined);

    const { result } = renderHook(() => useExperimentalWindowManagement());

    await expect(result.current.requestPermission()).resolves.toBe(false);
  });

  it("reports supported: true when window.getScreenDetails exists", () => {
    stubGetScreenDetails(new MockScreenDetails([], {}));

    const { result } = renderHook(() => useExperimentalWindowManagement());

    expect(result.current.supported).toBe(true);
  });

  it("populates screens and currentScreen once permission is granted", async () => {
    const primary = { isPrimary: true, label: BUILT_IN_DISPLAY_LABEL };
    const secondary = { isPrimary: false, label: EXTERNAL_DISPLAY_LABEL };
    stubGetScreenDetails(new MockScreenDetails([primary, secondary], primary));

    const { result } = renderHook(() => useExperimentalWindowManagement());

    await act(async () => {
      await expect(result.current.requestPermission()).resolves.toBe(true);
    });

    expect(result.current.screens).toEqual([primary, secondary]);
    expect(result.current.currentScreen).toEqual(primary);
  });

  it("updates screens on a screenschange event", async () => {
    const primary = { label: BUILT_IN_DISPLAY_LABEL };
    const details = new MockScreenDetails([primary], primary);
    stubGetScreenDetails(details);

    const { result } = renderHook(() => useExperimentalWindowManagement());
    await act(async () => {
      await result.current.requestPermission();
    });

    const secondary = { label: EXTERNAL_DISPLAY_LABEL };
    details.screens = [primary, secondary];
    await act(async () => {
      details.dispatchEvent(new Event("screenschange"));
    });

    await waitFor(() => expect(result.current.screens).toEqual([primary, secondary]));
  });

  it("updates currentScreen on a currentscreenchange event", async () => {
    const primary = { label: BUILT_IN_DISPLAY_LABEL };
    const secondary = { label: EXTERNAL_DISPLAY_LABEL };
    const details = new MockScreenDetails([primary, secondary], primary);
    stubGetScreenDetails(details);

    const { result } = renderHook(() => useExperimentalWindowManagement());
    await act(async () => {
      await result.current.requestPermission();
    });

    details.currentScreen = secondary;
    await act(async () => {
      details.dispatchEvent(new Event("currentscreenchange"));
    });

    await waitFor(() => expect(result.current.currentScreen).toEqual(secondary));
  });

  it("resolves false from requestPermission when the user denies the prompt", async () => {
    stubGetScreenDetails(() => Promise.reject(new Error("Permission denied")));

    const { result } = renderHook(() => useExperimentalWindowManagement());

    await expect(result.current.requestPermission()).resolves.toBe(false);
  });

  it("removes listeners on unmount", async () => {
    const details = new MockScreenDetails([], {});
    stubGetScreenDetails(details);
    const removeSpy = vi.spyOn(details, "removeEventListener");

    const { result, unmount } = renderHook(() => useExperimentalWindowManagement());
    await act(async () => {
      await result.current.requestPermission();
    });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("screenschange", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("currentscreenchange", expect.any(Function));
  });

  it("reflects window.screen.isExtended without requiring permission", () => {
    stubIsExtended(true);

    const { result } = renderHook(() => useExperimentalWindowManagement());

    expect(result.current.isExtended).toBe(true);
  });
});
