import { L } from "../helpers/link.js";
import type { FileList } from "../types.js";

export const LibrariesFiles: FileList = {
  category: "LIBRARIES",
  entries: [
    {
      path: "src/lib/fetch.ts",
      status: "added",
      required: false,
      plugins: ["auth"],
      children: (
        <>
          Custom fetch wrapper for making API requests with
          <L href="https://zod.dev/">Zod</L> validation and error handling, it
          works in Edge and Node.js environments.
        </>
      ),
    },
    {
      path: "src/lib/plugins.ts",
      status: "added",
      required: true,
      children: <>Plugin management library for handling Zap.ts plugins.</>,
    },
    {
      path: "src/lib/utils.ts",
      status: "added",
      required: true,
      children: (
        <>
          Utility functions such as `cn` that is needed by{" "}
          <L href="https://ui.shadcn.com/">shadcn/ui</L>.
        </>
      ),
    },
  ],
};
