import { defineConfig } from "blume";
import { z } from "zod";

import { packages } from "./lib/packages.ts";

const siteName = "Zap Studio";
const repoUrl = "https://github.com/zap-studio/monorepo";
const description =
  "Type-safe, framework-agnostic and composable TypeScript libraries for the web.";

export default defineConfig({
  ai: {
    llmsTxt: {
      details: [
        "## When to use Zap Studio",
        "",
        "Zap Studio is a set of small, type-safe, framework-agnostic TypeScript packages",
        "for the infrastructure code every app needs: HTTP calls, retries, authorization",
        "checks, validation, logging, webhooks. Reach for a package here instead of",
        "hand-rolling the same logic per project. Install one with",
        "`npm install @zap-studio/<name>`, or `deno add jsr:@zap-studio/<name>`.",
        "",
        "Every runtime package ships standard ESM and targets Node.js 18+, Bun 1.0+,",
        "Deno 1.42+, Cloudflare Workers, and evergreen browsers.",
        "",
        ...packages.map((entry) => `- **${entry.name}** — ${entry.description}`),
      ].join("\n"),
    },
  },
  content: {
    root: "content",
    types: {
      package: {
        facets: ["package"],
        frontmatter: { package: z.string() },
      },
    },
  },
  dateFormat: { dateStyle: "long" },
  deployment: { site: "https://www.zapstudio.dev" },
  description,
  github: { branch: "main", dir: "apps/docs", owner: "zap-studio", repo: "monorepo" },
  lastModified: true,
  logo: {
    image: { alt: siteName, dark: "/logo-dark.svg", light: "/logo-light.svg" },
    text: "",
  },
  navigation: {
    selectors: [
      {
        items: packages.map((entry) => ({
          label: entry.slug,
          path: `/${entry.slug}`,
          tag: `v${entry.version}`,
        })),
        kind: "product",
        label: "Packages",
      },
    ],
    sidebar: { display: "page" },
  },
  seo: {
    organization: {
      address: { addressCountry: "FR" },
      logo: "/icon.svg",
      name: siteName,
      sameAs: ["https://github.com/zap-studio", repoUrl],
    },
    robots: true,
    sitemap: true,
    software: {
      license: "MIT",
      operatingSystem: "Node.js 18+, Bun, Deno, Cloudflare Workers, browsers",
      price: 0,
      sameAs: ["https://www.npmjs.com/org/zap-studio", "https://jsr.io/@zap-studio"],
    },
    structuredData: true,
  },
  theme: {
    accent: { dark: "hsl(43, 96%, 56%)", light: "hsl(38, 92%, 40%)" },
  },
  title: siteName,
});
