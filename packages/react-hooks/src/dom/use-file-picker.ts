import { useCallback, useMemo } from "react";

import {
  getFileSystemAccess,
  type DirectoryPickerOptions,
  type OpenFilePickerOptions,
  type SaveFilePickerOptions,
} from "./_file-system-access-api.ts";

/** The shape returned by `useFilePicker`. */
export interface UseFilePickerResult {
  showDirectoryPicker: (
    options?: DirectoryPickerOptions,
  ) => Promise<FileSystemDirectoryHandle | undefined>;
  showOpenFilePicker: (
    options?: OpenFilePickerOptions,
  ) => Promise<FileSystemFileHandle[] | undefined>;
  showSaveFilePicker: (
    options?: SaveFilePickerOptions,
  ) => Promise<FileSystemFileHandle | undefined>;
  supported: boolean;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

/**
 * Wraps the File System Access API: `showOpenFilePicker`,
 * `showSaveFilePicker`, and `showDirectoryPicker`. This API only works in
 * Chromium browsers, not yet in Safari or Firefox. Where it's not
 * supported, `supported` is `false` and every method resolves `undefined`
 * without opening a dialog. Each method also resolves `undefined` instead
 * of throwing an error when the user closes the native picker without
 * choosing anything.
 *
 * @example
 * ```tsx
 * const { showOpenFilePicker, supported } = useFilePicker();
 * const handles = supported ? await showOpenFilePicker({ multiple: true }) : undefined;
 * ```
 */
export const useFilePicker = (): UseFilePickerResult => {
  const supported = Boolean(getFileSystemAccess().showOpenFilePicker);

  const showOpenFilePicker = useCallback(
    async (options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[] | undefined> => {
      const picker = getFileSystemAccess().showOpenFilePicker;
      if (!picker) {
        return undefined;
      }
      try {
        return await picker(options);
      } catch (error) {
        if (isAbortError(error)) {
          return undefined;
        }
        throw error;
      }
    },
    [],
  );

  const showSaveFilePicker = useCallback(
    async (options?: SaveFilePickerOptions): Promise<FileSystemFileHandle | undefined> => {
      const picker = getFileSystemAccess().showSaveFilePicker;
      if (!picker) {
        return undefined;
      }
      try {
        return await picker(options);
      } catch (error) {
        if (isAbortError(error)) {
          return undefined;
        }
        throw error;
      }
    },
    [],
  );

  const showDirectoryPicker = useCallback(
    async (options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle | undefined> => {
      const picker = getFileSystemAccess().showDirectoryPicker;
      if (!picker) {
        return undefined;
      }
      try {
        return await picker(options);
      } catch (error) {
        if (isAbortError(error)) {
          return undefined;
        }
        throw error;
      }
    },
    [],
  );

  return useMemo(
    () => ({ showDirectoryPicker, showOpenFilePicker, showSaveFilePicker, supported }),
    [showDirectoryPicker, showOpenFilePicker, showSaveFilePicker, supported],
  );
};
