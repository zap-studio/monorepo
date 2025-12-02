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
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/icon.png",
    nav: [
      { text: "Home", link: "/" },
      { text: "Team", link: "/team" },
      { text: "About Us", link: "/about-us" },
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

    sidebar: [
      {
        text: "Overview",
        items: [
          { text: "Introduction", link: "/introduction" },
          { text: "About Us", link: "/about-us" },
        ],
      },
    ],

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
