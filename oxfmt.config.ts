import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  sortTailwindcss: {
    functions: ["cn"],
    stylesheet: "apps/docs/src/styles/app.css",
  },
});
