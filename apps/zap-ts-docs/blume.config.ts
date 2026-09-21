import { defineConfig } from "blume";

const siteName = "zap.ts";
const repoUrl = "https://github.com/zap-studio/zap.ts";
const description =
  "The TypeScript SaaS starter kit. Auth, billing, database, mail, storage and queues, wired and ready.";

export default defineConfig({
  ai: { llmsTxt: true },
  content: { root: "content" },
  dateFormat: { dateStyle: "long" },
  deployment: { site: "https://zap-ts.zapstudio.dev" },
  description,
  github: { branch: "main", dir: "apps/zap-ts-docs", owner: "zap-studio", repo: "monorepo" },
  lastModified: true,
  navigation: {
    sidebar: { display: "page" },
  },
  search: { provider: "orama" },
  seo: {
    organization: {
      address: { addressCountry: "FR" },
      name: "Zap Studio",
      sameAs: ["https://github.com/zap-studio", repoUrl],
    },
    robots: true,
    sitemap: true,
    structuredData: true,
  },
  theme: {
    accent: { dark: "hsl(43, 96%, 56%)", light: "hsl(38, 92%, 40%)" },
    mode: "system",
    radius: "none",
  },
  title: siteName,
});
