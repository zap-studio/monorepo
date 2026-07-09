import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import browserCollections from "fumadocs-mdx:collections/browser";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { PencilIcon } from "lucide-react";
import { Suspense } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { getMDXComponents } from "@/components/mdx";
import { getMarkdownUrl, source } from "@/lib/content/source";
import { baseOptions, gitConfig } from "@/lib/layout/layout.shared";
import { pageMeta } from "@/lib/site";
import { getExternalLinkProps } from "@/lib/utils/links";

const loadDocsPageFn = createServerFn({ method: "GET" })
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) {
      // oxlint-disable-next-line only-throw-error -- TanStack Router expects its notFound sentinel to be thrown.
      throw notFound();
    }

    return {
      markdownUrl: getMarkdownUrl(page),
      pageTree: await source.serializePageTree(source.getPageTree()),
      path: page.path,
      slugs: page.slugs,
    };
  });

type DocsTabs = Extract<
  NonNullable<ComponentPropsWithoutRef<typeof DocsLayout>["tabs"]>,
  { transform?: unknown }
>;

const docsTabs = {
  transform: (option, node) => ({
    ...option,
    description: undefined,
    icon:
      node.icon === null || node.icon === undefined ? undefined : (
        <span className="flex size-full items-center justify-center text-fd-primary [&_svg]:size-5 md:[&_svg]:size-4">
          {node.icon}
        </span>
      ),
  }),
} satisfies DocsTabs;

const docsClientLoader = browserCollections.docs.createClientLoader<{
  githubUrl: string;
  markdownUrl: string;
}>({
  component({ default: Mdx, frontmatter, lastModified, toc }, props) {
    return (
      <DocsPage
        full={frontmatter.full}
        tableOfContent={{ style: "clerk" }}
        tableOfContentPopover={{ style: "clerk" }}
        toc={toc}
      >
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription className="mb-0">
          {frontmatter.description}
        </DocsDescription>
        <div className="flex flex-row items-center gap-2 border-b pb-6">
          <LLMCopyButton markdownUrl={props.markdownUrl} />
          <ViewOptions
            githubUrl={props.githubUrl}
            markdownUrl={props.markdownUrl}
          />
        </div>
        <DocsBody>
          <Mdx components={getMDXComponents()} />
          <div
            className="mt-8 flex flex-row flex-wrap items-center justify-between gap-4 border-t pt-4"
            suppressHydrationWarning
          >
            <a
              className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              href={props.githubUrl}
              {...getExternalLinkProps(props.githubUrl)}
            >
              <PencilIcon className="size-3" />
              Edit on GitHub
            </a>
            {lastModified ? (
              <PageLastUpdate date={new Date(lastModified)} />
            ) : null}
          </div>
        </DocsBody>
      </DocsPage>
    );
  },
});

// oxlint-disable-next-line sort-keys -- TanStack Router type inference and React Doctor require loader before head.
export const Route = createFileRoute("/docs/$")({
  // oxlint-disable-next-line no-use-before-define -- Route component uses Route.useLoaderData().
  component: DocsRoute,
  loader: async ({ params }) => {
    const data = await loadDocsPageFn({
      data: params._splat?.split("/") ?? [],
    });

    await docsClientLoader.preload(data.path);
    return data;
  },
  head: () => ({
    meta: pageMeta("Documentation", "Browse the Zap Studio documentation."),
  }),
});

// oxlint-disable-next-line func-style -- TanStack route object references this hoisted component.
function DocsRoute() {
  const loaderData = Route.useLoaderData();
  const { pageTree, path } = useFumadocsLoader(loaderData);
  const { markdownUrl } = loaderData;

  return (
    <DocsLayout {...baseOptions()} links={[]} tabs={docsTabs} tree={pageTree}>
      <Suspense>
        {docsClientLoader.useContent(path, {
          githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${path}`,
          markdownUrl,
        })}
      </Suspense>
    </DocsLayout>
  );
}
