import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
// @ts-expect-error // FIXME: remove when plugin types are fixed
import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component(
      "CopyOrDownloadAsMarkdownButtons",
      CopyOrDownloadAsMarkdownButtons
    );
  },
} satisfies Theme;
