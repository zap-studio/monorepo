"use client";
import "client-only";

import { useCallback, useEffect, useState } from "react";

interface ExtendedHTMLElement extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface ExtendedDocument extends Document {
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  mozFullScreenElement?: Element;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
}

export function useFullscreen({
  element,
  onFullscreenChange,
}: {
  element?: React.RefObject<HTMLElement>;
  onFullscreenChange?: (isFullscreen: boolean) => void;
} = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    const targetElement = (element?.current ||
      document.documentElement) as ExtendedHTMLElement;
    try {
      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen();
      } else if (targetElement.mozRequestFullScreen) {
        await targetElement.mozRequestFullScreen();
      } else if (targetElement.webkitRequestFullscreen) {
        await targetElement.webkitRequestFullscreen();
      } else if (targetElement.msRequestFullscreen) {
        await targetElement.msRequestFullscreen();
      }
    } catch {
      // Silently handle fullscreen entry failure
    }
  }, [element]);

  const exitFullscreen = useCallback(async () => {
    const extendedDocument = document as ExtendedDocument;
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (extendedDocument.mozCancelFullScreen) {
        await extendedDocument.mozCancelFullScreen();
      } else if (extendedDocument.webkitExitFullscreen) {
        await extendedDocument.webkitExitFullscreen();
      } else if (extendedDocument.msExitFullscreen) {
        await extendedDocument.msExitFullscreen();
      }
    } catch {
      // Silently handle fullscreen exit failure
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const extendedDocument = document as ExtendedDocument;
      const fullscreenElement =
        document.fullscreenElement ||
        extendedDocument.mozFullScreenElement ||
        extendedDocument.webkitFullscreenElement ||
        extendedDocument.msFullscreenElement;

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
