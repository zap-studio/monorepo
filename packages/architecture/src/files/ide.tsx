import { L } from "../helpers/link.js";
import type { FileList } from "../types.js";

export const IdeFiles: FileList = {
  category: "IDE",
  entries: [
    {
      path: ".cursor/",
      status: "added",
      required: false,
      folder: true,
      ide: "cursor",
      children: (
        <>
          Contains{" "}
          <L href="https://modelcontextprotocol.io/">
            MCP (Model Context Protocol)
          </L>{" "}
          that allows LLMs in <L href="https://cursor.com/">Cursor</L> to get
          more context with external services such as{" "}
          <L href="https://supabase.com/">Supabase</L>,
          <L href="https://posthog.com/">PostHog</L>, and more.
        </>
      ),
    },
    {
      path: ".cursorignore",
      status: "added",
      required: false,
      ide: "cursor",
      children: (
        <>
          Similar to `.gitignore`, this file specifies which files and
          directories should be ignored by{" "}
          <L href="https://cursor.com/">Cursor</L>.
        </>
      ),
    },
    {
      path: ".github/copilot-instructions.md",
      status: "added",
      required: false,
      ide: "vscode",
      children: (
        <>
          Contains <L href="https://github.com/">GitHub</L> specific files such
          as workflows for CI/CD, instructions for
          <L href="https://github.com/features/copilot">Copilot</L>.
        </>
      ),
    },
    {
      path: ".vscode/",
      status: "added",
      required: false,
      folder: true,
      ide: "vscode",
      children: (
        <>
          Contains{" "}
          <L href="https://code.visualstudio.com/">Visual Studio Code</L>{" "}
          specific settings and configurations such as{" "}
          <L href="https://modelcontextprotocol.io/">
            MCP (Model Context Protocol)
          </L>
          , debugging configurations, and more.
        </>
      ),
    },
    {
      path: ".windsurf/",
      status: "added",
      required: false,
      folder: true,
      ide: "windsurf",
      children: (
        <>
          Contains <L href="https://windsurf.com/">Windsurf</L> specific
          settings and configurations such as{" "}
          <L href="https://modelcontextprotocol.io/">
            MCP (Model Context Protocol)
          </L>
          .
        </>
      ),
    },
  ],
};
