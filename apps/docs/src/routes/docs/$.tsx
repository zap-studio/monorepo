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

import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { useMDXComponents } from "@/components/mdx";
import { getMarkdownUrl, source } from "@/lib/content/source";
import { baseOptions, gitConfig } from "@/lib/layout/layout.shared";
import { pageMeta } from "@/lib/site";

type SerializedPageTree = Awaited<ReturnType<typeof source.serializePageTree>>;

interface DocsLoaderData {
  markdownUrl: string;
  path: string;
  pageTree: SerializedPageTree;
  slugs: string[];
}

export const Route = createFileRoute("/docs/$")({
  head: () => ({
    meta: pageMeta("Documentation", "Browse the Zap Studio documentation."),
  }),
  loader: async ({ params }) => {
    const data = (await loadDocsPageFn({
      data: params._splat?.split("/") ?? [],
    })) as DocsLoaderData;

    await docsClientLoader.preload(data.path);
    return data;
  },
  component: DocsRoute,
});

function DocsRoute() {
  const loaderData = Route.useLoaderData() as DocsLoaderData;
  const { pageTree, path } = useFumadocsLoader(loaderData);
  const { markdownUrl } = loaderData;

  return (
    <DocsLayout
      {...baseOptions()}
      links={[]}
      sidebar={{
        tabs: {
          transform: (option, node) => ({
            ...option,
            icon: node.icon ? (
              <span className="text-fd-primary flex size-full items-center justify-center [&_svg]:size-5 md:[&_svg]:size-4">
                {node.icon}
              </span>
            ) : undefined,
            description: undefined,
          }),
        },
      }}
      tree={pageTree}
    >
      <Suspense>
        {docsClientLoader.useContent(path, {
          githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${path}`,
          markdownUrl,
        })}
      </Suspense>
    </DocsLayout>
  );
}

const loadDocsPageFn = createServerFn({ method: "GET" })
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) {
      throw notFound();
    }

    return {
      markdownUrl: getMarkdownUrl(page),
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
      slugs: page.slugs,
    };
  });

const docsClientLoader = browserCollections.docs.createClientLoader<{
  githubUrl: string;
  markdownUrl: string;
}>({
  component({ default: MDX, frontmatter, lastModified, toc }, props) {
    return (
      <DocsPage
        full={frontmatter.full}
        tableOfContent={{ style: "clerk" }}
        tableOfContentPopover={{ style: "clerk" }}
        toc={toc}
      >
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription className="mb-0">{frontmatter.description}</DocsDescription>
        <div className="flex flex-row items-center gap-2 border-b pb-6">
          <LLMCopyButton markdownUrl={props.markdownUrl} />
          <ViewOptions githubUrl={props.githubUrl} markdownUrl={props.markdownUrl} />
        </div>
        <DocsBody>
          <MDX components={useMDXComponents()} />
          <div className="mt-8 flex flex-row flex-wrap items-center justify-between gap-4 border-t pt-4">
            <a
              className="text-fd-muted-foreground hover:text-fd-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
              href={props.githubUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              <PencilIcon className="size-3" />
              Edit on GitHub
            </a>
            {lastModified ? <PageLastUpdate date={new Date(lastModified)} /> : null}
          </div>
        </DocsBody>
      </DocsPage>
    );
  },
});
