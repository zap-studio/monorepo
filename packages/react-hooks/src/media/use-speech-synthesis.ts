import { useCallback, useEffect, useState } from "react";

/** Options accepted by `useSpeechSynthesis`'s `speak()`. */
export interface SpeakOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  voice?: SpeechSynthesisVoice;
}

/** The shape returned by `useSpeechSynthesis`. */
export interface UseSpeechSynthesisResult {
  cancel: () => void;
  speak: (text: string, options?: SpeakOptions) => void;
  speaking: boolean;
  supported: boolean;
}

const isSupported = (): boolean => typeof window !== "undefined" && Boolean(window.speechSynthesis);

/**
 * Wraps the text-to-speech part of the Web Speech API
 * (`window.speechSynthesis`). `speaking` tracks the current utterance
 * using its `start`, `end`, and `error` events. `supported` is `false`
 * by default (safe for server-side rendering) when Speech Synthesis
 * doesn't exist, and `speak()`/`cancel()` do nothing in that case.
 *
 * @example
 * ```tsx
 * const { speak, speaking } = useSpeechSynthesis();
 * <button onClick={() => speak("Hello there")} disabled={speaking}>Speak</button>
 * ```
 */
export const useSpeechSynthesis = (): UseSpeechSynthesisResult => {
  const supported = isSupported();
  const [speaking, setSpeaking] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, options: SpeakOptions = {}): void => {
    if (!isSupported()) {
      return;
    }
    const newUtterance = new SpeechSynthesisUtterance(text);
    if (options.voice) {
      newUtterance.voice = options.voice;
    }
    if (options.rate !== undefined) {
      newUtterance.rate = options.rate;
    }
    if (options.pitch !== undefined) {
      newUtterance.pitch = options.pitch;
    }
    if (options.lang !== undefined) {
      newUtterance.lang = options.lang;
    }
    setUtterance(newUtterance);
  }, []);

  const cancel = useCallback((): void => {
    if (!isSupported()) {
      return;
    }
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => {
    if (!utterance) {
      return undefined;
    }
    const handleStart = () => setSpeaking(true);
    const handleEnd = () => setSpeaking(false);
    const handleError = () => setSpeaking(false);

    utterance.addEventListener("start", handleStart);
    utterance.addEventListener("end", handleEnd);
    utterance.addEventListener("error", handleError);
    window.speechSynthesis.speak(utterance);
    return () => {
      utterance.removeEventListener("start", handleStart);
      utterance.removeEventListener("end", handleEnd);
      utterance.removeEventListener("error", handleError);
    };
  }, [utterance]);

  useEffect(() => cancel, [cancel]);

  return { cancel, speak, speaking, supported };
};
