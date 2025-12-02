import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zap Studio",
  description: "Making the web better",
  srcDir: "./src",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],

    sidebar: [
      {
        text: "Zap Studio",
        items: [],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/zap-studio" }],
  },
});
