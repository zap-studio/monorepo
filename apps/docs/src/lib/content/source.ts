import { loader } from "fumadocs-core/source";
import type { InferPageType } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { docs } from "fumadocs-mdx:collections/server";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  plugins: [lucideIconsPlugin()],
  source: docs.toFumadocsSource(),
});

export const getMarkdownUrl = (page: InferPageType<typeof source>) =>
  `/llms.mdx${page.url}`;

export const getLLMText = async (page: InferPageType<typeof source>) => {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
};
