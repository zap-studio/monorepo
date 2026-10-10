/** One accepted file type entry, as passed to `showOpenFilePicker`/`showSaveFilePicker`. */
interface FilePickerAcceptType {
  accept: Record<string, string[]>;
  description?: string;
}

/** Options `showOpenFilePicker` accepts. */
interface OpenFilePickerOptions {
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
  types?: FilePickerAcceptType[];
}

/** Options `showSaveFilePicker` accepts. */
interface SaveFilePickerOptions {
  excludeAcceptAllOption?: boolean;
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}

/** Options `showDirectoryPicker` accepts. */
interface DirectoryPickerOptions {
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
const getFileSystemAccess = (): FileSystemAccessWindow => {
  if (typeof window === "undefined") {
    return {};
  }
  // SAFETY: these File System Access functions are not declared on Window. We read them as optional, so a browser without support (Safari, Firefox) gives undefined instead of throwing.
  return window as FileSystemAccessWindow;
};

export { getFileSystemAccess };
export type {
  FilePickerAcceptType,
  OpenFilePickerOptions,
  SaveFilePickerOptions,
  DirectoryPickerOptions,
};
