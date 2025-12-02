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
  },
});
