import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { PencilIcon } from "lucide-react";
import { icons } from "lucide-react";
import browserCollections from "fumadocs-mdx:collections/browser";
import type * as PageTree from "fumadocs-core/page-tree";
import { createElement, type ReactNode, useMemo } from "react";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { getMarkdownUrl, getPageImage, source } from "@/lib/content/source";
import { baseOptions, gitConfig } from "@/lib/layout/layout.shared";
import { pageMeta, siteDescription } from "@/lib/site";
import { getMDXComponents } from "@/mdx-components";

interface DocsLoaderData {
  description: string;
  githubUrl: string;
  imageUrl: string;
  markdownUrl: string;
  path: string;
  title: string;
  tree: unknown;
}

export const Route = createFileRoute("/docs/$")({
  head: () => ({
    meta: pageMeta("Documentation", "Browse the Zap Studio documentation."),
  }),
  loader: async ({ params }) => {
    const data = (await loadDocsPageFn({
      data: {
        slugs: getSlug(params._splat) ?? [],
      },
    })) as DocsLoaderData;

    await docsClientLoader.preload(data.path);
    return data;
  },
  component: DocsRoute,
});

function DocsRoute() {
  const loaderData = Route.useLoaderData() as DocsLoaderData;
  const tree = useMemo(
    () => restorePageTreeIcons(loaderData.tree as PageTree.Root),
    [loaderData.tree],
  );

  return (
    <DocsLayout
      {...baseOptions()}
      links={[]}
      sidebar={{
        tabs: {
          transform: (option, node) => ({
            ...option,
            icon: node.icon ? (
              <span className="flex size-full items-center justify-center text-fd-primary [&_svg]:size-5 md:[&_svg]:size-4">
                {node.icon}
              </span>
            ) : undefined,
            description: undefined,
          }),
        },
      }}
      tree={tree}
    >
      {docsClientLoader.useContent(loaderData.path, {
        githubUrl: loaderData.githubUrl,
        markdownUrl: loaderData.markdownUrl,
      })}
    </DocsLayout>
  );
}

const loadDocsPageFn = createServerFn({ method: "GET" })
  .inputValidator((data: { slugs: string[] }) => data)
  .handler(({ data }) => {
    const page = source.getPage(data.slugs);
    if (!page) {
      throw notFound();
    }

    const markdownUrl = getMarkdownUrl(page);
    const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${page.path}`;

    return {
      description: page.data.description ?? siteDescription,
      githubUrl,
      imageUrl: getPageImage(page).url,
      markdownUrl,
      path: page.path,
      title: page.data.title,
      tree: JSON.parse(JSON.stringify(source.getPageTree())),
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
          <MDX components={getMDXComponents()} />
          <div className="mt-8 flex flex-row flex-wrap items-center justify-between gap-4 border-t pt-4">
            <a
              className="inline-flex items-center gap-1.5 text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
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

function getSlug(splat?: string) {
  if (!splat) {
    return undefined;
  }

  const segments = splat.split("/").filter(Boolean);
  return segments.length > 0 ? segments : undefined;
}

function restorePageTreeIcons(root: PageTree.Root): PageTree.Root {
  return {
    ...root,
    children: root.children.map(restoreNodeIcons),
    fallback: root.fallback ? restorePageTreeIcons(root.fallback) : undefined,
  };
}

function restoreNodeIcons(node: PageTree.Node): PageTree.Node {
  if (node.type === "folder") {
    return {
      ...node,
      icon: resolveLucideIcon(node.icon),
      index: node.index
        ? {
            ...node.index,
            icon: resolveLucideIcon(node.index.icon),
          }
        : undefined,
      children: node.children.map(restoreNodeIcons),
    };
  }

  if (node.type === "page") {
    return {
      ...node,
      icon: resolveLucideIcon(node.icon),
    };
  }

  return {
    ...node,
    icon: resolveLucideIcon(node.icon),
  };
}

function resolveLucideIcon(icon: unknown) {
  if (typeof icon !== "string") {
    return icon as ReactNode;
  }

  const Icon = icons[icon as keyof typeof icons];
  return Icon ? createElement(Icon) : undefined;
}
