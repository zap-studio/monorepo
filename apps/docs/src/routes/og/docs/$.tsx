import { createFileRoute, notFound } from "@tanstack/react-router";
import { ImageResponse } from "@takumi-rs/image-response";
import { generate as DefaultImage } from "fumadocs-ui/og/takumi";
import { source } from "@/lib/source";

export const Route = createFileRoute("/og/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const segments = getSegments(params._splat);
        const page = source.getPage(segments.slice(0, -1));

        if (!page) {
          throw notFound();
        }

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
          },
        );
      },
    },
  },
});

function getSegments(splat?: string) {
  return splat ? splat.split("/").filter(Boolean) : [];
}
