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
  // SAFETY: SpeechRecognitionErrorEvent is not part of the official DOM standard yet (the Web Speech API is still a draft), so TypeScript's DOM types may or may not include it. This hook only checks that an error event fired, and never reads any fields from it, so we don't need to define its shape here.
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
  // SAFETY: SpeechRecognition (and its prefixed version, webkitSpeechRecognition, used by Safari and Chromium) isn't declared in TypeScript's DOM types. Every caller uses this function to look it up, so an unsupported browser like Firefox gets undefined instead of an error.
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
 * Wraps the voice input part of the Web Speech API (`SpeechRecognition`,
 * or its `webkitSpeechRecognition` version on Safari). It only works in
 * Chromium and Safari. Firefox doesn't support either one, so `supported`
 * is `false` there (also the default for server-side rendering), and
 * `start()`/`stop()` do nothing in that case. `transcript` builds up the
 * recognized text as `result` events come in.
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
