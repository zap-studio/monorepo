/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Effect } from "effect";

export function useFullscreen({
  element,
  onFullscreenChange,
}: {
  element?: React.RefObject<HTMLElement>;
  onFullscreenChange?: (isFullscreen: boolean) => void;
} = {}) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const enterFullscreen = React.useCallback(async () => {
    const targetElement = element?.current || document.documentElement;
    await Effect.runPromise(
      Effect.tryPromise({
        try: async () => {
          if (targetElement.requestFullscreen) {
            await targetElement.requestFullscreen();
          } else if (
            "mozRequestFullScreen" in targetElement &&
            typeof (targetElement as any).mozRequestFullScreen === "function"
          ) {
            await (targetElement as any).mozRequestFullScreen();
          } else if (
            "webkitRequestFullscreen" in targetElement &&
            typeof (targetElement as any).webkitRequestFullscreen === "function"
          ) {
            await (targetElement as any).webkitRequestFullscreen();
          } else if (
            "msRequestFullscreen" in targetElement &&
            typeof (targetElement as any).msRequestFullscreen === "function"
          ) {
            await (targetElement as any).msRequestFullscreen();
          }
        },
        catch: (error) => error,
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("Failed to enter fullscreen mode:", error);
          }),
        ),
      ),
    );
  }, [element]);

  const exitFullscreen = React.useCallback(async () => {
    await Effect.runPromise(
      Effect.tryPromise({
        try: async () => {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (
            "mozCancelFullScreen" in document &&
            typeof (document as any).mozCancelFullScreen === "function"
          ) {
            await (document as any).mozCancelFullScreen();
          } else if (
            "webkitExitFullscreen" in document &&
            typeof (document as any).webkitExitFullscreen === "function"
          ) {
            await (document as any).webkitExitFullscreen();
          } else if (
            "msExitFullscreen" in document &&
            typeof (document as any).msExitFullscreen === "function"
          ) {
            await (document as any).msExitFullscreen();
          }
        },
        catch: (error) => error,
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("Failed to exit fullscreen mode:", error);
          }),
        ),
      ),
    );
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen, isFullscreen]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement;

      const newIsFullscreen = !!fullscreenElement;
      setIsFullscreen(newIsFullscreen);

      if (onFullscreenChange) {
        onFullscreenChange(newIsFullscreen);
      }
    };

    const abortController = new AbortController();

    document.addEventListener("fullscreenchange", handleFullscreenChange, {
      signal: abortController.signal,
    });
    document.addEventListener("mozfullscreenchange", handleFullscreenChange, {
      signal: abortController.signal,
    });
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange,
      { signal: abortController.signal },
    );
    document.addEventListener("MSFullscreenChange", handleFullscreenChange, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
    };
  }, [onFullscreenChange]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
