import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zap Studio",
  description: "Making the web better",
  srcDir: "./src",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Team", link: "/team" },
      { text: "About Us", link: "/about-us" },
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

    socialLinks: [{ icon: "github", link: "https://github.com/zap-studio" }],

    editLink: {
      pattern:
        "https://github.com/zap-studio/monorepo/edit/main/apps/docs/src/:path",
    },
    search: {
      provider: "local",
    },
  },
  lastUpdated: true,
});
