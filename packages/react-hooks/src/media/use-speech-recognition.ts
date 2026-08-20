import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternativeLike | undefined;
}

interface SpeechRecognitionEventLike {
  readonly results: {
    readonly length: number;
    readonly [index: number]: SpeechRecognitionResultLike | undefined;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  // SAFETY: SpeechRecognitionErrorEvent isn't part of the official DOM standard IDL (the Web Speech API is a community-group draft), so TypeScript's DOM lib may or may not declare it depending on version/editor; this hook never reads fields off the error event, only that one fired, so no shape is needed here.
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  abort: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: SpeechRecognition (and its Safari/Chromium-prefixed webkitSpeechRecognition twin) isn't declared in TypeScript's DOM lib; every caller goes through this lookup, so an unsupported browser (Firefox) degrades to undefined rather than throwing.
  const target = window as WindowWithSpeechRecognition;
  return target.SpeechRecognition ?? target.webkitSpeechRecognition;
};

/** Options accepted by `useSpeechRecognition`. */
export interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

/** The shape returned by `useSpeechRecognition`. */
export interface UseSpeechRecognitionResult {
  listening: boolean;
  start: () => void;
  stop: () => void;
  supported: boolean;
  transcript: string;
}

/**
 * Wraps the Web Speech API's recognition half (`SpeechRecognition`, or its
 * `webkitSpeechRecognition` twin on Safari) — voice input. Chromium/Safari
 * only; Firefox never exposes either constructor, so `supported: false`
 * there (the SSR-safe default too), and `start()`/`stop()` then no-op.
 * `transcript` accumulates recognized text across `result` events.
 *
 * @example
 * ```tsx
 * const { transcript, listening, start, stop } = useSpeechRecognition({ continuous: true });
 * ```
 */
export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult => {
  const { continuous = false, interimResults = false, lang } = options;
  const supported = getSpeechRecognitionConstructor() !== undefined;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const start = useCallback((): void => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      return;
    }
    const recognition = new Constructor();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    if (lang !== undefined) {
      recognition.lang = lang;
    }
    recognition.onresult = (event) => {
      let combined = "";
      for (let index = 0; index < event.results.length; index += 1) {
        combined += event.results[index]?.[0]?.transcript ?? "";
      }
      setTranscript(combined);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }, [continuous, interimResults, lang]);

  const stop = useCallback((): void => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { listening, start, stop, supported, transcript };
};
