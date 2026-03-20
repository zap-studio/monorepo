import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { getExternalLinkProps } from "@/lib/utils/links";

export function getMDXComponents(components?: MDXComponents) {
  const DefaultLink = defaultMdxComponents.a ?? "a";

  return {
    ...defaultMdxComponents,
    a: (props: ComponentPropsWithoutRef<"a">): ReactNode => (
      <DefaultLink {...props} {...getExternalLinkProps(props.href)} />
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
