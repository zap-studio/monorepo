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
 * Checks `typeof navigator === "undefined"` first.
 * `useExperimentalSelectAudioOutput` calls this directly in the hook body
 * on every render, including during server-side rendering, not only
 * inside an effect.
 */
const getSelectAudioOutput = (): SelectAudioOutput | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  // SAFETY: We read MediaDevices.selectAudioOutput as optional, no matter what the TypeScript DOM types say. This way, browsers that don't have it (like Safari or Firefox) just return undefined instead of throwing an error.
  return (navigator.mediaDevices as MediaDevicesWithSelectAudioOutput | undefined)
    ?.selectAudioOutput;
};

/** The shape returned by `useExperimentalSelectAudioOutput`. */
export interface UseExperimentalSelectAudioOutputResult {
  selectAudioOutput: (options?: SelectAudioOutputOptions) => Promise<MediaDeviceInfo | undefined>;
  supported: boolean;
}

/**
 * Wraps `MediaDevices.selectAudioOutput()`, which shows the browser's
 * built-in picker for choosing an audio output device. MDN marks this as
 * experimental, and it only works in Chromium browsers. You must call it
 * from a user action, like a click handler, not from an effect. It
 * resolves with the chosen `MediaDeviceInfo`, or `undefined` if the user
 * cancels or a Permissions Policy blocks the request. `supported` is
 * `false` by default (safe for server-side rendering) when the API
 * doesn't exist.
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
