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
 * Wraps the Web Speech API's synthesis half (`window.speechSynthesis`) —
 * text-to-speech. `speaking` tracks the current utterance via its
 * `start`/`end`/`error` events. `supported: false` — the SSR-safe default
 * — where Speech Synthesis doesn't exist, and `speak()`/`cancel()` then
 * no-op.
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

  const speak = useCallback((text: string, options: SpeakOptions = {}): void => {
    if (!isSupported()) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (options.voice) {
      utterance.voice = options.voice;
    }
    if (options.rate !== undefined) {
      utterance.rate = options.rate;
    }
    if (options.pitch !== undefined) {
      utterance.pitch = options.pitch;
    }
    if (options.lang !== undefined) {
      utterance.lang = options.lang;
    }
    utterance.addEventListener("start", () => setSpeaking(true));
    utterance.addEventListener("end", () => setSpeaking(false));
    utterance.addEventListener("error", () => setSpeaking(false));
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback((): void => {
    if (!isSupported()) {
      return;
    }
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  return { cancel, speak, speaking, supported };
};
