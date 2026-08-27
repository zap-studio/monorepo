import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useSpeechRecognition } from "./use-speech-recognition.ts";

interface MockRecognitionResult {
  0?: { transcript: string };
  length: number;
}

interface MockRecognitionEvent {
  results: { length: number; [index: number]: MockRecognitionResult | undefined };
}

class MockRecognition {
  static instances: MockRecognition[] = [];
  continuous = false;
  interimResults = false;
  lang = "";
  onend: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onresult: ((event: MockRecognitionEvent) => void) | null = null;
  aborted = false;
  started = false;
  stopped = false;

  constructor() {
    MockRecognition.instances.push(this);
  }

  abort() {
    this.aborted = true;
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
    this.onend?.();
  }
}

const installMockSpeechRecognition = () => {
  MockRecognition.instances = [];
  Object.defineProperty(window, "SpeechRecognition", {
    configurable: true,
    value: MockRecognition,
  });
};

const makeResultEvent = (transcripts: string[]): MockRecognitionEvent => {
  const results: Record<number, MockRecognitionResult> & { length: number } = {
    length: transcripts.length,
  };
  for (const [index, transcript] of transcripts.entries()) {
    results[index] = { 0: { transcript }, length: 1 };
  }
  return { results };
};

afterEach(() => {
  Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
  Object.defineProperty(window, "webkitSpeechRecognition", {
    configurable: true,
    value: undefined,
  });
});

describe("useSpeechRecognition", () => {
  it("reports supported: true when SpeechRecognition exists", () => {
    installMockSpeechRecognition();

    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.supported).toBe(true);
    expect(result.current.listening).toBe(false);
    expect(result.current.transcript).toBe("");
  });

  it("falls back to webkitSpeechRecognition", () => {
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      value: MockRecognition,
    });

    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.supported).toBe(true);
  });

  it("reports supported: false when neither constructor exists", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.supported).toBe(false);
  });

  it("start() creates a recognizer configured from options and begins listening", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() =>
      useSpeechRecognition({ continuous: true, interimResults: true, lang: "fr-FR" }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.listening).toBe(true);
    const recognizer = MockRecognition.instances[0];
    expect(recognizer?.started).toBe(true);
    expect(recognizer?.continuous).toBe(true);
    expect(recognizer?.interimResults).toBe(true);
    expect(recognizer?.lang).toBe("fr-FR");
  });

  it("does not set lang when none is given", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });

    expect(MockRecognition.instances[0]?.lang).toBe("");
  });

  it("accumulates transcript text from result events", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });

    act(() => {
      MockRecognition.instances[0]?.onresult?.(makeResultEvent(["hello", " world"]));
    });

    expect(result.current.transcript).toBe("hello world");
  });

  it("tolerates a result entry with no alternatives", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });

    const results = { 0: { length: 0 }, length: 1 };
    act(() => {
      MockRecognition.instances[0]?.onresult?.({ results });
    });

    expect(result.current.transcript).toBe("");
  });

  it("becomes listening: false when recognition ends", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    act(() => {
      MockRecognition.instances[0]?.onend?.();
    });

    expect(result.current.listening).toBe(false);
  });

  it("becomes listening: false when recognition errors", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    act(() => {
      MockRecognition.instances[0]?.onerror?.(new Event("error"));
    });

    expect(result.current.listening).toBe(false);
  });

  it("start() no-ops when unsupported", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(() => {
      act(() => {
        result.current.start();
      });
    }).not.toThrow();
    expect(result.current.listening).toBe(false);
  });

  it("stop() stops the underlying recognizer", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.stop();
    });

    expect(MockRecognition.instances[0]?.stopped).toBe(true);
    expect(result.current.listening).toBe(false);
  });

  it("stop() no-ops when nothing is listening", () => {
    installMockSpeechRecognition();
    const { result } = renderHook(() => useSpeechRecognition());

    expect(() => {
      act(() => {
        result.current.stop();
      });
    }).not.toThrow();
  });

  it("aborts an active recognizer on unmount", () => {
    installMockSpeechRecognition();
    const { result, unmount } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });

    unmount();

    expect(MockRecognition.instances[0]?.aborted).toBe(true);
  });
});
