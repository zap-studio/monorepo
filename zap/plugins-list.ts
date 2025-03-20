import { PluginsMetadata } from "./plugins";

export const plugins: PluginsMetadata = [
  {
    name: "drizzle",
    category: "orm",
    dependencies: ["drizzle-orm", "@neondatabase/serverless"],
  },
  { name: "prisma", category: "orm", dependencies: ["prisma"] },
  { name: "pwa", dependencies: [] },
  {
    name: "legal",
    dependencies: [
      "@mdx-js/react",
      "@mdx-js/loader",
      "@next/mdx",
      "@types/mdx",
    ],
  },
  { name: "admin-dashboard", dependencies: [] },
  {
    name: "blog",
    dependencies: [
      "@mdx-js/react",
      "@mdx-js/loader",
      "@next/mdx",
      "@types/mdx",
    ],
  },
  {
    name: "polar",
    dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
  },
  { name: "stripe", dependencies: ["@better-auth/stripe", "stripe"] },
  { name: "emails", dependencies: ["resend", "react-email"] },
  {
    name: "ai",
    dependencies: ["ai", "@ai-sdk/react", "@ai-sdk/openai", "@ai-sdk/mistral"],
  },
];
