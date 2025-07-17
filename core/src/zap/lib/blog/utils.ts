import fs from "node:fs/promises";
import path from "node:path";

import { format, formatDistanceToNow } from "date-fns";
import { Effect } from "effect";
import matter from "gray-matter";

import type { Metadata } from "@/zap/types/blog.types";

function parseFrontmatter(fileContent: string) {
  return Effect.try({
    try: () => matter(fileContent),
    catch: (error) =>
      new Error(
        `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
      ),
  }).pipe(
    Effect.map(({ data: metadata, content }) => ({
      metadata: metadata as Metadata,
      content,
    })),
  );
}

async function getMDXFiles(dir: string) {
  const effect = Effect.tryPromise({
    try: () => fs.readdir(dir),
    catch: (error) => new Error(`Failed to read directory: ${error}`),
  }).pipe(
    Effect.map((files) =>
      files.filter((file) => path.extname(file) === ".mdx"),
    ),
  );

  return await Effect.runPromise(effect);
}

async function readMDXFile(filePath: string) {
  const effect = Effect.tryPromise({
    try: () => fs.readFile(filePath, "utf-8"),
    catch: (error) => new Error(`Failed to read file ${filePath}: ${error}`),
  }).pipe(Effect.flatMap(parseFrontmatter));

  return await Effect.runPromise(effect);
}

async function getMDXData(dir: string) {
  const effect = Effect.tryPromise({
    try: () => getMDXFiles(dir),
    catch: (error) => new Error(`Failed to get MDX files: ${error}`),
  }).pipe(
    Effect.flatMap((mdxFiles) =>
      Effect.all(
        mdxFiles.map((file) =>
          Effect.tryPromise({
            try: () => readMDXFile(path.join(dir, file)),
            catch: (error) =>
              new Error(`Failed to read MDX file ${file}: ${error}`),
          }).pipe(
            Effect.map(({ metadata, content }) => ({
              metadata,
              slug: path.basename(file, path.extname(file)),
              content,
            })),
          ),
        ),
      ),
    ),
  );

  return await Effect.runPromise(effect);
}

export async function getBlogPosts() {
  return await getMDXData(path.join(process.cwd(), "src", "blog"));
}

export async function getBlogPost(slug: string) {
  const effect = Effect.tryPromise({
    try: () =>
      readMDXFile(path.join(process.cwd(), "src", "blog", `${slug}.mdx`)),
    catch: (error) => new Error(`Failed to read blog post ${slug}: ${error}`),
  }).pipe(
    Effect.map(({ metadata, content }) => ({
      metadata,
      slug,
      content,
    })),
  );

  return await Effect.runPromise(effect);
}

export function formatDate(date: string, includeRelative = false) {
  const targetDate = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  const fullDate = format(targetDate, "MMMM d, yyyy");

  if (includeRelative) {
    const relativeDate = formatDistanceToNow(targetDate, { addSuffix: true });
    return `${fullDate} (${relativeDate})`;
  }

  return fullDate;
}
