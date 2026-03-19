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

        const [{ ImageResponse }, { generate: DefaultImage }] = await Promise.all([
          import("@takumi-rs/image-response"),
          import("fumadocs-ui/og/takumi"),
        ]);

        return new ImageResponse(
          <DefaultImage
            description={page.data.description}
            site="Zap Studio"
            title={page.data.title}
          />,
          {
            width: 1200,
            height: 630,
            format: "webp",
            headers: {
              "cache-control": "public, max-age=0, s-maxage=86400",
            },
          },
        );
      },
    },
  },
});

function getSegments(splat?: string) {
  return splat ? splat.split("/").filter(Boolean) : [];
}
