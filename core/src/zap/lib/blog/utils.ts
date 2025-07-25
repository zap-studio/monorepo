import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Effect } from "effect";
import matter from "gray-matter";

import { BASE_URL, ZAP_DEFAULT_METADATA } from "@/zap.config";
import { postMetadataSchema } from "@/zap/schemas/blog.schema";

const BLOG_DIR = path.join(process.cwd(), "src", "blog");

function parseFrontmatter(fileContent: string) {
  return Effect.try({
    try: () => matter(fileContent),
    catch: (error) =>
      new Error(
        `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
      ),
  }).pipe(
    Effect.flatMap(({ data: metadata, content }) =>
      Effect.try({
        try: () => ({
          metadata: postMetadataSchema.parse(metadata),
          content,
        }),
        catch: (error) =>
          new Error(
            `Invalid frontmatter structure: ${error instanceof Error ? error.message : String(error)}`,
          ),
      }),
    ),
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
  return await getMDXData(BLOG_DIR);
}

export async function getBlogPostsMetadata() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    ...post.metadata,
    slug: post.slug,
  }));
}

export async function getBlogPost(slug: string) {
  const effect = Effect.tryPromise({
    try: () => readMDXFile(path.join(BLOG_DIR, `${slug}.mdx`)),
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
  const targetDate = parseISO(date);
  const fullDate = format(targetDate, "MMMM d, yyyy");

  if (includeRelative) {
    const relativeDate = formatDistanceToNow(targetDate, { addSuffix: true });
    return `${fullDate} (${relativeDate})`;
  }

  return fullDate;
}

export async function generateBlogPostMetadata(slug: string) {
  const post = await getBlogPost(slug);

  if (!post) {
    return;
  }

  const openGraphImage =
    post.metadata.image ||
    `${BASE_URL}/opengraph-image?title=${post.metadata.title}`;

  return {
    title: `${post.metadata.title} | ${ZAP_DEFAULT_METADATA.title}`,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      url: `${BASE_URL}/blog/${slug}`,
      images: [{ url: openGraphImage }],
    },
    twitter: {
      title: post.metadata.title,
      description: post.metadata.description,
      card: "summary_large_image",
      images: [openGraphImage],
    },
  };
}
