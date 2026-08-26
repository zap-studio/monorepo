/** A simple local copy of the File System Access API types. It only works in Chromium browsers, and not every version of TypeScript's DOM types includes it. */
export interface FileSystemFileHandle {
  readonly kind: "file";
  readonly name: string;
}

/** A simple local copy of the File System Access API types. It only works in Chromium browsers, and not every version of TypeScript's DOM types includes it. */
export interface FileSystemDirectoryHandle {
  readonly kind: "directory";
  readonly name: string;
}

/** One accepted file type entry, as passed to `showOpenFilePicker`/`showSaveFilePicker`. */
export interface FilePickerAcceptType {
  accept: Record<string, string[]>;
  description?: string;
}

/** Options `showOpenFilePicker` accepts. */
export interface OpenFilePickerOptions {
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
  types?: FilePickerAcceptType[];
}

/** Options `showSaveFilePicker` accepts. */
export interface SaveFilePickerOptions {
  excludeAcceptAllOption?: boolean;
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}

/** Options `showDirectoryPicker` accepts. */
export interface DirectoryPickerOptions {
  id?: string;
  mode?: "read" | "readwrite";
}

interface FileSystemAccessWindow {
  showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
  showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

/**
 * Checks for `typeof window === "undefined"`. This is needed because
 * `useFilePicker` calls this function directly during render (including on
 * the server), not just inside an effect.
 */
export const getFileSystemAccess = (): FileSystemAccessWindow => {
  if (typeof window === "undefined") {
    return {};
  }
  // SAFETY: we read these File System Access API functions as optional, no matter what the current TypeScript DOM types say. This way, a browser that doesn't have them (Safari, Firefox) just gives us undefined instead of an error.
  return window as FileSystemAccessWindow;
};
