import { useCallback } from "react";

/** Options the Audio Output Devices API's `MediaDevices.selectAudioOutput()` accepts. */
export interface SelectAudioOutputOptions {
  deviceId?: string;
}

type SelectAudioOutput = (options?: SelectAudioOutputOptions) => Promise<MediaDeviceInfo>;

interface MediaDevicesWithSelectAudioOutput {
  selectAudioOutput?: SelectAudioOutput;
}

/**
 * Guards `typeof navigator === "undefined"` because
 * `useExperimentalSelectAudioOutput` reads this synchronously in the hook
 * body, on every render including SSR — not just from an effect.
 */
const getSelectAudioOutput = (): SelectAudioOutput | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  // SAFETY: MediaDevices.selectAudioOutput is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return (navigator.mediaDevices as MediaDevicesWithSelectAudioOutput | undefined)
    ?.selectAudioOutput;
};

/** The shape returned by `useExperimentalSelectAudioOutput`. */
export interface UseExperimentalSelectAudioOutputResult {
  selectAudioOutput: (options?: SelectAudioOutputOptions) => Promise<MediaDeviceInfo | undefined>;
  supported: boolean;
}

/**
 * Wraps `MediaDevices.selectAudioOutput()` — Experimental per MDN,
 * Chromium-only — showing the browser's native audio output device
 * picker. Must be called from a user gesture (a click handler, not an
 * effect); resolves the picked `MediaDeviceInfo`, or `undefined` when the
 * user cancels or a Permissions Policy blocks the request
 * (`NotAllowedError`). `supported: false` — the SSR-safe default — where
 * the API doesn't exist.
 *
 * @example
 * ```tsx
 * const { selectAudioOutput, supported } = useExperimentalSelectAudioOutput();
 * <button onClick={() => selectAudioOutput()} disabled={!supported}>
 *   Choose speaker
 * </button>
 * ```
 */
export const useExperimentalSelectAudioOutput = (): UseExperimentalSelectAudioOutputResult => {
  const supported = Boolean(getSelectAudioOutput());

  const selectAudioOutput = useCallback(
    async (options?: SelectAudioOutputOptions): Promise<MediaDeviceInfo | undefined> => {
      const select = getSelectAudioOutput();
      if (!select) {
        return undefined;
      }
      try {
        return await select(options);
      } catch (error) {
        if (error instanceof Error && error.name === "NotAllowedError") {
          return undefined;
        }
        throw error;
      }
    },
    [],
  );

  return { selectAudioOutput, supported };
};
