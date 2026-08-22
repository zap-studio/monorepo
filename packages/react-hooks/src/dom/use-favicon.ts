import { useEffect } from "react";

const getOrCreateFaviconLink = (): HTMLLinkElement => {
  const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (existing) {
    return existing;
  }
  const link = document.createElement("link");
  link.rel = "icon";
  document.head.append(link);
  return link;
};

/**
 * Imperatively swaps the `<link rel="icon">` `href` — creates the tag if
 * the document doesn't already have one. Restores the previous `href` on
 * unmount.
 *
 * @example
 * ```tsx
 * useFavicon(hasUnread ? "/favicon-unread.svg" : "/favicon.svg");
 * ```
 */
export const useFavicon = (href: string): void => {
  useEffect(() => {
    const link = getOrCreateFaviconLink();
    const previousHref = link.href;
    link.href = href;
    return () => {
      link.href = previousHref;
    };
  }, [href]);
};
