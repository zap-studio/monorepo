import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { PencilIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { gitConfig } from "@/lib/layout.shared";
import { getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  return (
    <DocsPage
      full={page.data.full}
      tableOfContent={{ style: "clerk" }}
      tableOfContentPopover={{ style: "clerk" }}
      toc={page.data.toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
          markdownUrl={`${page.url}.mdx`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        <div className="mt-8 flex flex-row flex-wrap items-center justify-between gap-4 border-t pt-4">
          <a
            className="inline-flex items-center gap-1.5 text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${page.path}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            <PencilIcon className="size-3" />
            Edit on GitHub
          </a>
          {page.data.lastModified && (
            <PageLastUpdate date={page.data.lastModified} />
          )}
        </div>
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return await Promise.resolve(source.generateParams());
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
