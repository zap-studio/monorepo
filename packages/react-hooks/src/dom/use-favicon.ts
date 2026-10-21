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
 * Sets the `href` of the `<link rel="icon">` tag (the favicon). Creates
 * the tag if the page doesn't already have one. Restores the previous
 * `href` when the component unmounts.
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
