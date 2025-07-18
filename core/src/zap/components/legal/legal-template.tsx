import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import type { Metadata } from "next";

import { CustomMDX } from "@/zap/components/blog/mdx";

async function getMdxContent(slug: string) {
  const MDX_PATH = path.join(
    process.cwd(),
    "src",
    "zap",
    "legal",
    `${slug}.mdx`,
  );
  const raw = await fs.readFile(MDX_PATH, "utf-8");
  const { data: metadata, content } = matter(raw);
  return { metadata, content };
}

export async function generateLegalMetadata(slug: string): Promise<Metadata> {
  const { metadata } = await getMdxContent(slug);
  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export async function LegalPage({ slug }: { slug: string }) {
  const { content } = await getMdxContent(slug);
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <CustomMDX source={content} />
      </article>
    </div>
  );
}
