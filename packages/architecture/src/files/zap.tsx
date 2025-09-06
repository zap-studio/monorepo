import type { FileList } from "../types.js";

export const ZapFiles: FileList = {
  category: "ZAP",
  entries: [
    {
      path: "zap.config.ts",
      status: "added",
      required: true,
      children: <>Configuration files for Zap.ts.</>,
    },
    {
      path: "zap.config.types.ts",
      status: "added",
      required: true,
      children: <>Type definitions for Zap.ts configuration.</>,
    },
    {
      path: "zap/",
      status: "added",
      required: true,
      children: (
        <>
          Zap.ts plugin directories such as `auth`, `blog`, and `waitlist`. Each
          plugin contains its own routes, components, hooks, and other necessary
          files to provide specific functionality to the application.
        </>
      ),
    },
  ],
};
