export const isExternalHref = (href: string): boolean =>
  /^(?:[a-z]+:)?\/\//iu.test(href);

export const getExternalLinkProps = (href?: string) => {
  if (href === undefined || href.length === 0 || !isExternalHref(href)) {
    return {};
  }

  return {
    rel: "noreferrer noopener",
    target: "_blank",
  } as const;
};
