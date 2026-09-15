import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
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
  Reflect.deleteProperty(window, "speechSynthesis");
  Reflect.deleteProperty(window, "SpeechSynthesisUtterance");
});

describe("useSpeechSynthesis", () => {
  it("reports supported: true when window.speechSynthesis exists", async () => {
    installMockSpeechSynthesis();

    const { result } = await renderHook(() => useSpeechSynthesis());

    expect(result.current.supported).toBe(true);
    expect(result.current.speaking).toBe(false);
  });

  it("reports supported: false when window.speechSynthesis is unavailable", async () => {
    const { result } = await renderHook(() => useSpeechSynthesis());

    expect(result.current.supported).toBe(false);
  });

  it("speak() calls speechSynthesis.speak() and becomes speaking: true on start", async () => {
    const { speak } = installMockSpeechSynthesis();
    const { result } = await renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });

    expect(speak).toHaveBeenCalledTimes(1);
    expect(result.current.speaking).toBe(true);
  });

  it("applies rate/pitch/lang/voice options to the utterance", async () => {
    const { speak } = installMockSpeechSynthesis();
    const { result } = await renderHook(() => useSpeechSynthesis());
    const voice = asTestDouble<SpeechSynthesisVoice>({});

    await act(async () => {
      result.current.speak("hello", { lang: "fr-FR", pitch: 1.5, rate: 0.5, voice });
    });

    const [utterance] = speak.mock.calls[0] ?? [];
    expect(utterance?.lang).toBe("fr-FR");
    expect(utterance?.pitch).toBe(1.5);
    expect(utterance?.rate).toBe(0.5);
    expect(utterance?.voice).toBe(voice);
  });

  it("becomes speaking: false when the utterance ends", async () => {
    const { speak } = installMockSpeechSynthesis();
    const { result } = await renderHook(() => useSpeechSynthesis());

    let utterance: SpeechSynthesisUtterance | undefined;
    await act(async () => {
      result.current.speak("hello");
    });
    [utterance] = speak.mock.calls[0] ?? [];

    await act(async () => {
      utterance?.dispatchEvent(new Event("end"));
    });

    expect(result.current.speaking).toBe(false);
  });

  it("becomes speaking: false when the utterance errors", async () => {
    const { speak } = installMockSpeechSynthesis();
    const { result } = await renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });
    const [utterance] = speak.mock.calls[0] ?? [];

    await act(async () => {
      utterance?.dispatchEvent(new Event("error"));
    });

    expect(result.current.speaking).toBe(false);
  });

  it("speak() no-ops when unsupported", async () => {
    const { result } = await renderHook(() => useSpeechSynthesis());

    expect(async () => {
      await act(() => {
        result.current.speak("hello");
      });
    }).not.toThrow();
    expect(result.current.speaking).toBe(false);
  });

  it("cancel() calls speechSynthesis.cancel() and resets speaking", async () => {
    const { cancel } = installMockSpeechSynthesis();
    const { result } = await renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });
    expect(result.current.speaking).toBe(true);

    await act(() => {
      result.current.cancel();
    });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(result.current.speaking).toBe(false);
  });

  it("cancel() no-ops when unsupported", async () => {
    const { result } = await renderHook(() => useSpeechSynthesis());

    expect(async () => {
      await act(() => {
        result.current.cancel();
      });
    }).not.toThrow();
  });

  it("cancels any in-progress speech on unmount", async () => {
    const { cancel } = installMockSpeechSynthesis();
    const { result, unmount } = await renderHook(() => useSpeechSynthesis());

    await act(async () => {
      result.current.speak("hello");
    });

    await unmount();

    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
