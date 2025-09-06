import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import matter from "gray-matter";
import { ApplicationError, FileOperationError } from "@/zap/errors";
import { BASE_URL, ZAP_DEFAULT_METADATA } from "@/zap.config";

import { postMetadataSchema } from "../schemas";
import { ZAP_BLOG_CONFIG } from "../zap.plugin.config";

const BLOG_DIR = ZAP_BLOG_CONFIG.DATA_DIR;

function parseFrontmatter(fileContent: string) {
  try {
    const { data: metadata, content } = matter(fileContent);
    return {
      metadata: postMetadataSchema.parse(metadata),
      content,
    };
  } catch (error) {
    throw new ApplicationError("Failed to parse frontmatter", error);
  }
}

async function getMDXFiles(dir: string) {
  try {
    const files = await fs.readdir(dir);
    return files.filter((file) => path.extname(file) === ".mdx");
  } catch (error) {
    throw new FileOperationError("Failed to read directory", error);
  }
}

async function readMDXFile(filePath: string) {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return parseFrontmatter(fileContent);
  } catch (error) {
    throw new FileOperationError("Failed to read file", error);
  }
}

async function getMDXData(dir: string) {
  try {
    const mdxFiles = await getMDXFiles(dir);
    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        try {
          const { metadata, content } = await readMDXFile(path.join(dir, file));
          return {
            metadata,
            slug: path.basename(file, path.extname(file)),
            content,
          };
        } catch (error) {
          throw new FileOperationError(
            `Failed to read MDX file ${file}`,
            error
          );
        }
      })
    );
    return posts;
  } catch (error) {
    throw new ApplicationError("Failed to get MDX data", error);
  }
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
  try {
    const { metadata, content } = await readMDXFile(
      path.join(BLOG_DIR, `${slug}.mdx`)
    );
    return {
      metadata,
      slug,
      content,
    };
  } catch (error) {
    throw new ApplicationError(`Failed to read blog post ${slug}`, error);
  }
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
    return ZAP_DEFAULT_METADATA;
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
