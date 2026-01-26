import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { defineConfig } from "vitepress";
import llmstxt, {
  copyOrDownloadAsMarkdownButtons,
} from "vitepress-plugin-llms";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zap Studio",
  description: "Making the web better",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  cleanUrls: true,
  srcDir: "./src",
  sitemap: {
    hostname: "https://www.zapstudio.dev",
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/icon.png",
    nav: [
      { text: "Home", link: "/" },
      { text: "Zap.ts", link: "/zap-ts/" },
      { text: "Local.ts", link: "/local-ts/" },
      {
        text: "Packages",
        items: [
          { text: "@zap-studio/events", link: "/packages/events/" },
          { text: "@zap-studio/fetch", link: "/packages/fetch/" },
          { text: "@zap-studio/logging", link: "/packages/logging/" },
          { text: "@zap-studio/permit", link: "/packages/permit/" },
          { text: "@zap-studio/realtime", link: "/packages/realtime/" },
          { text: "@zap-studio/validation", link: "/packages/validation/" },
          { text: "@zap-studio/waitlist", link: "/packages/waitlist/" },
          { text: "@zap-studio/webhooks", link: "/packages/webhooks/" },
        ],
      },
      { text: "About", link: "/about" },
      {
        text: "More",
        items: [
          { text: "llms.txt", link: "/llms.txt" },
          {
            text: "llms-full.txt",
            link: "/llms-full.txt",
          },
        ],
      },
    ],

    sidebar: {
      "/": [
        {
          text: "Overview",
          items: [
            { text: "Introduction", link: "/introduction" },
            { text: "About", link: "/about" },
          ],
        },
      ],
      "/zap-ts/": [
        {
          text: "Zap.ts",
          items: [{ text: "Overview", link: "/zap-ts/" }],
        },
      ],
      "/local-ts/": [
        {
          text: "Local.ts",
          items: [
            { text: "Overview", link: "/local-ts/" },
            { text: "Motivation", link: "/local-ts/motivation" },
            { text: "Getting Started", link: "/local-ts/getting-started" },
          ],
        },
        {
          text: "Customization",
          items: [
            { text: "Project Identity", link: "/local-ts/project-identity" },
            { text: "Sidebar Navigation", link: "/local-ts/sidebar" },
            { text: "App Icons", link: "/local-ts/app-icons" },
          ],
        },
        {
          text: "Guides",
          items: [
            { text: "Settings", link: "/local-ts/settings" },
            { text: "Theming", link: "/local-ts/theming" },
            { text: "Database", link: "/local-ts/database" },
            { text: "Notifications", link: "/local-ts/notifications" },
            { text: "Logging", link: "/local-ts/logging" },
            { text: "System Tray", link: "/local-ts/system-tray" },
            { text: "Window State", link: "/local-ts/window-state" },
            { text: "Autostart", link: "/local-ts/autostart" },
            { text: "Splash Screen", link: "/local-ts/splash-screen" },
          ],
        },
        {
          text: "Tooling",
          items: [{ text: "Code Quality", link: "/local-ts/code-quality" }],
        },
        {
          text: "Distribution",
          items: [
            { text: "Packaging & Publishing", link: "/local-ts/distribution" },
          ],
        },
      ],
      "/packages/fetch/": [
        {
          text: "@zap-studio/fetch",
          items: [
            { text: "Overview", link: "/packages/fetch/" },
            { text: "API Methods", link: "/packages/fetch/api-methods" },
            { text: "Using $fetch", link: "/packages/fetch/fetch-function" },
            { text: "Factory Pattern", link: "/packages/fetch/create-fetch" },
            { text: "Error Handling", link: "/packages/fetch/errors" },
            { text: "Validation", link: "/packages/fetch/validation" },
          ],
        },
      ],
      "/packages/events/": [
        {
          text: "@zap-studio/events",
          items: [
            { text: "Overview", link: "/packages/events/" },
            { text: "Handlers", link: "/packages/events/handlers" },
            { text: "Error Handling", link: "/packages/events/error-handling" },
            { text: "Utilities", link: "/packages/events/utilities" },
          ],
        },
      ],
      "/packages/logging/": [
        {
          text: "@zap-studio/logging",
          items: [{ text: "Overview", link: "/packages/logging/" }],
        },
      ],
      "/packages/permit/": [
        {
          text: "@zap-studio/permit",
          items: [
            { text: "Overview", link: "/packages/permit/" },
            {
              text: "Creating Policies",
              link: "/packages/permit/creating-policies",
            },
            { text: "Policy Rules", link: "/packages/permit/policy-rules" },
            { text: "Conditions", link: "/packages/permit/conditions" },
            {
              text: "Role-Based Access Control",
              link: "/packages/permit/roles",
            },
            {
              text: "Merging Policies",
              link: "/packages/permit/merging-policies",
            },
            { text: "Error Handling", link: "/packages/permit/errors" },
          ],
        },
      ],
      "/packages/realtime/": [
        {
          text: "@zap-studio/realtime",
          items: [{ text: "Overview", link: "/packages/realtime/" }],
        },
      ],
      "/packages/validation/": [
        {
          text: "@zap-studio/validation",
          items: [{ text: "Overview", link: "/packages/validation/" }],
        },
      ],
      "/packages/waitlist/": [
        {
          text: "@zap-studio/waitlist",
          items: [{ text: "Overview", link: "/packages/waitlist/" }],
        },
      ],
      "/packages/webhooks/": [
        {
          text: "@zap-studio/webhooks",
          items: [{ text: "Overview", link: "/packages/webhooks/" }],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/zap-studio" },
      { icon: "discord", link: "https://discord.gg/8Ke3VCjjMf" },
    ],

    editLink: {
      pattern:
        "https://github.com/zap-studio/monorepo/edit/main/apps/docs/src/:path",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright:
        "Copyright © 2025-present Zap Studio (Alexandre Trotel and Contributors)",
    },
    search: {
      provider: "local",
      options: {
        detailedView: true,
      },
    },
  },
  lastUpdated: true,
  markdown: {
    // @ts-expect-error // FIXME: remove when plugin types are fixed
    codeTransformers: [transformerTwoslash()],
    // @ts-expect-error // FIXME: remove when plugin types are fixed
    languages: ["js", "jsx", "ts", "tsx"],
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons);
    },
  },
  vite: {
    plugins: [llmstxt()],
  },
});
