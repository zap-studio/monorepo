import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalSelectAudioOutput } from "./use-experimental-select-audio-output.ts";

const notAllowedError = (): Error => {
  const error = new Error("Permission denied.");
  error.name = "NotAllowedError";
  return error;
};

const setSelectAudioOutput = (
  selectAudioOutput: ((options?: unknown) => Promise<unknown>) | undefined,
) => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: selectAudioOutput ? { selectAudioOutput } : {},
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalSelectAudioOutput", () => {
  it("reports supported: false when selectAudioOutput is unavailable", () => {
    setSelectAudioOutput(undefined);

    const { result } = renderHook(() => useExperimentalSelectAudioOutput());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when MediaDevices.selectAudioOutput exists", () => {
    setSelectAudioOutput(vi.fn());

    const { result } = renderHook(() => useExperimentalSelectAudioOutput());

    expect(result.current.supported).toBe(true);
  });

  it("selectAudioOutput() forwards options and resolves the picked device", async () => {
    const selectAudioOutput = vi
      .fn()
      .mockResolvedValue({ deviceId: "abc", kind: "audiooutput", label: "Speakers" });
    setSelectAudioOutput(selectAudioOutput);

    const { result } = renderHook(() => useExperimentalSelectAudioOutput());

    await expect(result.current.selectAudioOutput({ deviceId: "abc" })).resolves.toEqual({
      deviceId: "abc",
      kind: "audiooutput",
      label: "Speakers",
    });
    expect(selectAudioOutput).toHaveBeenCalledWith({ deviceId: "abc" });
  });

  it("selectAudioOutput() resolves undefined when the user cancels or is blocked", async () => {
    setSelectAudioOutput(() => Promise.reject(notAllowedError()));

    const { result } = renderHook(() => useExperimentalSelectAudioOutput());

    await expect(result.current.selectAudioOutput()).resolves.toBeUndefined();
  });

  it("selectAudioOutput() rethrows other errors", async () => {
    setSelectAudioOutput(() => Promise.reject(new Error("no devices")));

    const { result } = renderHook(() => useExperimentalSelectAudioOutput());

    await expect(result.current.selectAudioOutput()).rejects.toThrow("no devices");
  });

  it("selectAudioOutput() resolves undefined when unsupported", async () => {
    setSelectAudioOutput(undefined);

    const { result } = renderHook(() => useExperimentalSelectAudioOutput());

    await expect(result.current.selectAudioOutput()).resolves.toBeUndefined();
  });
});
