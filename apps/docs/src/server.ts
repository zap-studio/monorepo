import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { source } from "@/lib/content/source";

export default createServerEntry({
  async fetch(request, opts) {
    const ogSegments = getOgSegments(request);

    if (!ogSegments) {
      return handler.fetch(request, opts);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        headers: {
          allow: "GET, HEAD",
        },
        status: 405,
      });
    }

    const page = source.getPage(ogSegments);

    if (!page) {
      return new Response("Not Found", { status: 404 });
    }

    const { createDocsOgImageResponse } = await import("@/lib/og/docs-image.server");

    return createDocsOgImageResponse({
      description: page.data.description,
      title: page.data.title,
    });
  },
});

function getOgSegments(request: Request) {
  const pathname = new URL(request.url).pathname;
  const prefix = "/og/docs/";

  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const segments = pathname
    .slice(prefix.length)
    .split("/")
    .filter(Boolean);

  const lastSegment = segments.at(-1);
  if (lastSegment?.startsWith("image.")) {
    segments.pop();
  }

  return segments;
}
