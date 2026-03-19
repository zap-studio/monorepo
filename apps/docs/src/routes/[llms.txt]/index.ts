import { createFileRoute } from "@tanstack/react-router";
import { source } from "@/lib/source";

export const Route = createFileRoute("/[llms/txt]/")({
  server: {
    handlers: {
      GET: () => {
        const lines: string[] = ["# Documentation", ""];

        for (const page of source.getPages()) {
          lines.push(`- [${page.data.title}](${page.url}): ${page.data.description}`);
        }

        return new Response(lines.join("\n"));
      },
    },
  },
});
