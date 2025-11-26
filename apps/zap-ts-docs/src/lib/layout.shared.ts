import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { DEMO_URL, GITHUB_REPO_URL } from "@/constants/website";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Zap.ts ⚡️",
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: "Demo",
        url: DEMO_URL,
        external: true,
      },
    ],
    githubUrl: GITHUB_REPO_URL,
  };
}
