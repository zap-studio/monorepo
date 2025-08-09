import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import type { Metadata } from "next";

const LEGAL_DIR = path.join(process.cwd(), "src", "legal");

export async function getMdxContent(slug: string) {
  const MDX_PATH = path.join(LEGAL_DIR, `${slug}.mdx`);
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
