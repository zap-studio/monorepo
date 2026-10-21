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
  // SAFETY: these File System Access functions are not declared on Window. We read them as optional, so a browser without support (Safari, Firefox) gives undefined instead of throwing.
  return window as FileSystemAccessWindow;
};
