import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSpeechSynthesis } from "./use-speech-synthesis.ts";

class MockUtterance extends EventTarget {
  lang = "";
  pitch = 1;
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;

  constructor(readonly text: string) {
    super();
  }
}

const installMockSpeechSynthesis = () => {
  const speak = vi.fn<(utterance: SpeechSynthesisUtterance) => void>(
    (utterance: SpeechSynthesisUtterance) => {
      utterance.dispatchEvent(new Event("start"));
    },
  );
  const cancel = vi.fn<() => void>();
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { cancel, speak },
  });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: MockUtterance,
  });
  return { cancel, speak };
};

afterEach(() => {
  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: undefined,
  });
});

describe("useSpeechSynthesis", () => {
  it("reports supported: true when window.speechSynthesis exists", () => {
    installMockSpeechSynthesis();

    const { result } = renderHook(() => useSpeechSynthesis());

    expect(result.current.supported).toBe(true);
    expect(result.current.speaking).toBe(false);
  });

  it("reports supported: false when window.speechSynthesis is unavailable", () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    expect(result.current.supported).toBe(false);
  });

  it("speak() calls speechSynthesis.speak() and becomes speaking: true on start", async () => {
    const { speak } = installMockSpeechSynthesis();
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });

    expect(speak).toHaveBeenCalledTimes(1);
    expect(result.current.speaking).toBe(true);
  });

  it("applies rate/pitch/lang/voice options to the utterance", async () => {
    const { speak } = installMockSpeechSynthesis();
    const { result } = renderHook(() => useSpeechSynthesis());
    // SAFETY: the hook only assigns `options.voice` straight to `utterance.voice` (see use-speech-synthesis.ts) without reading any SpeechSynthesisVoice member, and the assertion below checks `utterance.voice` by reference identity — so an empty object stand-in is safe.
    const voice = {} as SpeechSynthesisVoice;

    await act(async () => {
      result.current.speak("hello", { lang: "fr-FR", pitch: 1.5, rate: 0.5, voice });
    });

    // SAFETY: installMockSpeechSynthesis() ran first, so isSupported() is true and speak() unconditionally calls window.speechSynthesis.speak(utterance) exactly once — calls[0]?.[0] is therefore always the SpeechSynthesisUtterance that was passed, never undefined.
    const utterance = speak.mock.calls[0]?.[0] as SpeechSynthesisUtterance;
    expect(utterance.lang).toBe("fr-FR");
    expect(utterance.pitch).toBe(1.5);
    expect(utterance.rate).toBe(0.5);
    expect(utterance.voice).toBe(voice);
  });

  it("becomes speaking: false when the utterance ends", async () => {
    installMockSpeechSynthesis();
    const { result } = renderHook(() => useSpeechSynthesis());

    let utterance: SpeechSynthesisUtterance | undefined;
    await act(async () => {
      result.current.speak("hello");
    });
    // SAFETY: window.speechSynthesis.speak was installed as the vi.fn() mock from installMockSpeechSynthesis() above, so casting it to ReturnType<typeof vi.fn> to reach `.mock` is accurate; the act() call above guarantees `result.current.speak("hello")` invoked it, so calls[0]?.[0] is the SpeechSynthesisUtterance it received, never undefined.
    utterance = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as SpeechSynthesisUtterance;

    await act(async () => {
      utterance?.dispatchEvent(new Event("end"));
    });

    expect(result.current.speaking).toBe(false);
  });

  it("becomes speaking: false when the utterance errors", async () => {
    installMockSpeechSynthesis();
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });
    // SAFETY: window.speechSynthesis.speak was installed as the vi.fn() mock from installMockSpeechSynthesis() above, so casting it to ReturnType<typeof vi.fn> to reach `.mock` is accurate; the act() call above guarantees `result.current.speak("hello")` invoked it, so calls[0]?.[0] is the SpeechSynthesisUtterance it received, never undefined.
    const utterance = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as SpeechSynthesisUtterance;

    await act(async () => {
      utterance.dispatchEvent(new Event("error"));
    });

    expect(result.current.speaking).toBe(false);
  });

  it("speak() no-ops when unsupported", () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    expect(() => {
      act(() => {
        result.current.speak("hello");
      });
    }).not.toThrow();
    expect(result.current.speaking).toBe(false);
  });

  it("cancel() calls speechSynthesis.cancel() and resets speaking", async () => {
    const { cancel } = installMockSpeechSynthesis();
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });
    expect(result.current.speaking).toBe(true);

    act(() => {
      result.current.cancel();
    });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(result.current.speaking).toBe(false);
  });

  it("cancel() no-ops when unsupported", () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    expect(() => {
      act(() => {
        result.current.cancel();
      });
    }).not.toThrow();
  });

  it("cancels any in-progress speech on unmount", async () => {
    const { cancel } = installMockSpeechSynthesis();
    const { result, unmount } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });

    unmount();

    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
