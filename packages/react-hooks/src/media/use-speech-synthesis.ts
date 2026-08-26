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
    // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- these listeners are added to a new `utterance` created inside `speak()`, which runs from a user action, not from the effect below. The utterance is never stored or reused, so its listeners go away once it finishes, errors, or `cancel()` (called on unmount below) stops it.
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
