import { useSyncExternalStore } from "react";

const getSnapshot = (): DocumentVisibilityState => document.visibilityState;

const getServerSnapshot = (): DocumentVisibilityState => "visible";

const subscribe = (onStoreChange: () => void) => {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
};

/**
 * `document.visibilityState`, updating on the `visibilitychange` event.
 * Falls back to `"visible"` during server rendering and before the client
 * subscribes.
 *
 * @example
 * ```tsx
 * const visibility = useDocumentVisibility(); // "visible" | "hidden"
 * ```
 */
const useDocumentVisibility = (): DocumentVisibilityState =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export { useDocumentVisibility };
