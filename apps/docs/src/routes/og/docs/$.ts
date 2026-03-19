import { createFileRoute, notFound } from "@tanstack/react-router";
import { source } from "@/lib/content/source";

export const Route = createFileRoute("/og/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const segments = getSegments(params._splat);
        const page = source.getPage(segments.slice(0, -1));

        if (!page) {
          throw notFound();
        }

        const { createDocsOgImageResponse } = await import("@/lib/og/docs-image.server");

        return createDocsOgImageResponse({
          description: page.data.description,
          title: page.data.title,
        });
      },
    },
  },
});

function getSegments(splat?: string) {
  return splat ? splat.split("/").filter(Boolean) : [];
}
