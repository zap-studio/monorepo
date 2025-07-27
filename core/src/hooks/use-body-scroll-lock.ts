import { useEffect } from "react";

/**
 * Hook to lock/unlock body scroll
 * @param isLocked - Whether to lock the body scroll
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]);
}
