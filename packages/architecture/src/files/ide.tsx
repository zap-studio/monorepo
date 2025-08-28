import { Categories } from '../categories';
import type { FileList } from '../types';

export const IdeFiles: FileList = {
  category: Categories.IDE,
  entries: [
    {
      path: '.cursor/',
      status: 'added',
      required: false,
      folder: true,
      ide: 'cursor',
      children: (
        <>
          Contains [MCP (Model Context
          Protocol)](https://modelcontextprotocol.io/) that allows LLMs in
          [Cursor](https://cursor.com/) to get more context with external
          services such as [Supabase](https://supabase.com/),
          [PostHog](https://posthog.com/), and more.
        </>
      ),
    },
    {
      path: '.cursorignore',
      status: 'added',
      required: false,
      ide: 'cursor',
      children: (
        <>
          Similar to `.gitignore`, this file specifies which files and
          directories should be ignored by [Cursor](https://cursor.com/).
        </>
      ),
    },
    {
      path: '.github/copilot-instructions.md',
      status: 'added',
      required: false,
      ide: 'vscode',
      children: (
        <>
          Contains [GitHub](https://github.com/) specific files such as
          workflows for CI/CD, instructions for
          [Copilot](https://github.com/features/copilot).
        </>
      ),
    },
    {
      path: '.vscode/',
      status: 'added',
      required: false,
      folder: true,
      ide: 'vscode',
      children: (
        <>
          Contains [Visual Studio Code](https://code.visualstudio.com/) specific
          settings and configurations such as [MCP (Model Context
          Protocol)](https://modelcontextprotocol.io/), debugging
          configurations, and more.
        </>
      ),
    },
    {
      path: '.windsurf/',
      status: 'added',
      required: false,
      folder: true,
      ide: 'windsurf',
      children: (
        <>
          Contains [Windsurf](https://windsurf.com/) specific settings and
          configurations such as [MCP (Model Context
          Protocol)](https://modelcontextprotocol.io/).
        </>
      ),
    },
  ],
};
