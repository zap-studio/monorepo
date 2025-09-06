import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { ZAP_LEGAL_CONFIG } from "../zap.plugin.config";

const LEGAL_DIR = ZAP_LEGAL_CONFIG.DATA_DIR;

export async function getLegalContent(slug: string) {
  const MDX_PATH = path.join(LEGAL_DIR, `${slug}.mdx`);
  const raw = await fs.readFile(MDX_PATH, "utf-8");
  const { data: metadata, content } = matter(raw);
  return { metadata, content };
}

export async function generateLegalMetadata(slug: string) {
  const { metadata } = await getLegalContent(slug);
  return {
    title: metadata.title,
    description: metadata.description,
  };
}
