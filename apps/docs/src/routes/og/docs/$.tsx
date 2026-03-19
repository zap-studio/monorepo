import { createFileRoute, notFound } from "@tanstack/react-router";
import { source } from "@/lib/content/source";
import { createDocsOgImageResponse } from "@/lib/og/docs-image.server";

export const Route = createFileRoute("/og/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = params._splat?.split("/").filter(Boolean) ?? [];
        if (slugs.at(-1) === "image.webp") {
          slugs.pop();
        }

        const page = source.getPage(slugs);
        if (!page) {
          throw notFound();
        }

        return createDocsOgImageResponse({
          title: page.data.title,
          description: page.data.description,
        });
      },
    },
  },
});
