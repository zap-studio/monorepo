import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    ...tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    react(),
    ...nitro({
      preset: "vercel",
    }),
  ],
  resolve: {
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
});
