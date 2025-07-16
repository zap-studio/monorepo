import fs from "node:fs/promises";
import path from "node:path";

import { format, formatDistanceToNow } from "date-fns";
import { Effect } from "effect";
import matter from "gray-matter";

type Metadata = {
  title: string;
  description: string;
  date: string;
};

function parseFrontmatter(fileContent: string) {
  const { data: metadata, content } = matter(fileContent);
  return { metadata: metadata as Metadata, content };
}

const getMDXFiles = (dir: string) =>
  Effect.tryPromise({
    try: () => fs.readdir(dir),
    catch: (error) => new Error(`Failed to read directory: ${error}`),
  }).pipe(
    Effect.map((files) =>
      files.filter((file) => path.extname(file) === ".mdx"),
    ),
  );

const readMDXFile = (filePath: string) =>
  Effect.tryPromise({
    try: () => fs.readFile(filePath, "utf-8"),
    catch: (error) => new Error(`Failed to read file ${filePath}: ${error}`),
  }).pipe(Effect.map(parseFrontmatter));

const getMDXData = (dir: string) =>
  getMDXFiles(dir).pipe(
    Effect.flatMap((mdxFiles) =>
      Effect.all(
        mdxFiles.map((file) =>
          readMDXFile(path.join(dir, file)).pipe(
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

export const getBlogPosts = () =>
  getMDXData(path.join(process.cwd(), "src", "blog"));

export const getBlogPost = (slug: string) =>
  readMDXFile(path.join(process.cwd(), "src", "blog", `${slug}.mdx`)).pipe(
    Effect.map(({ metadata, content }) => ({
      metadata,
      slug,
      content,
    })),
  );

export function formatDate(date: string, includeRelative = false) {
  const targetDate = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  const fullDate = format(targetDate, "MMMM d, yyyy");

  if (includeRelative) {
    const relativeDate = formatDistanceToNow(targetDate, { addSuffix: true });
    return `${fullDate} (${relativeDate})`;
  }

  return fullDate;
}
