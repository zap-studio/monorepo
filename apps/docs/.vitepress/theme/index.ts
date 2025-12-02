import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
// @ts-expect-error // FIXME: remove when plugin types are fixed
import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue";

import "./custom.css";
import "@shikijs/vitepress-twoslash/style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(TwoslashFloatingVue);
    app.component(
      "CopyOrDownloadAsMarkdownButtons",
      CopyOrDownloadAsMarkdownButtons
    );
  },
} satisfies Theme;
