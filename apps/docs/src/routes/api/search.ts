import { createFileRoute } from "@tanstack/react-router";
import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/content/source";

const { GET: searchGet } = createFromSource(source, {
  language: "english",
});

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: ({ request }) => searchGet(request),
    },
  },
});
