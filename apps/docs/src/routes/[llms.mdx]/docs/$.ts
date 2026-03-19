import { createFileRoute, notFound } from "@tanstack/react-router";
import { getLLMText, source } from "@/lib/content/source";

export const Route = createFileRoute("/[llms/mdx]/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const page = source.getPage(getSlug(params._splat));
        if (!page) {
          throw notFound();
        }

        return new Response(await getLLMText(page), {
          headers: {
            "Content-Type": "text/markdown",
          },
        });
      },
    },
  },
});

function getSlug(splat?: string) {
  if (!splat) {
    return undefined;
  }

  const segments = splat.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);
  if (lastSegment === "index.mdx") {
    segments.pop();
  }

  return segments.length > 0 ? segments : undefined;
}
