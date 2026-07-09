import { createFileRoute, notFound } from "@tanstack/react-router";

import { getLLMText, source } from "@/lib/content/source";

export const Route = createFileRoute("/llms.mdx/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = params._splat?.split("/") ?? [];
        const page = source.getPage(slugs);
        if (!page) {
          // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router uses thrown notFound responses for control flow.
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
