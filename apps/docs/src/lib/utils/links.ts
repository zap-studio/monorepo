export function isExternalHref(href: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(href);
}

export function getExternalLinkProps(href?: string) {
  if (!href || !isExternalHref(href)) {
    return {};
  }

  return {
    rel: "noreferrer noopener",
    target: "_blank",
  } as const;
}
