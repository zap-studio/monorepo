/** Minimal local model of the File System Access API — Chromium-only, not declared in every TypeScript DOM lib. */
export interface FileSystemFileHandle {
  readonly kind: "file";
  readonly name: string;
}

/** Minimal local model of the File System Access API — Chromium-only, not declared in every TypeScript DOM lib. */
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
 * Guards `typeof window === "undefined"` (unlike `_navigation-api.ts`'s
 * `getNavigation()`) because `useFilePicker` reads this synchronously in
 * the hook body, on every render including SSR — not just from an effect.
 */
export const getFileSystemAccess = (): FileSystemAccessWindow => {
  if (typeof window === "undefined") {
    return {};
  }
  // SAFETY: these File System Access API entry points are read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares them, so a browser where they're genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return window as FileSystemAccessWindow;
};
