import type { PlopTypes } from "@turbo/gen";
import { createGenerator } from "./utils";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Package generator
  createGenerator(plop, "package", {
    directory: "packages",
    description: "Create a new package in the packages directory",
    promptMessage:
      "What is the name of the package? (e.g., 'my-package' or 'package/package-core')",
    additionalActions: [
      {
        type: "add",
        path: "packages/{{ path }}/src/index.ts",
        templateFile: "templates/package/src/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/jsr.json",
        templateFile: "templates/package/jsr.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/LICENSE.md",
        templateFile: "templates/package/LICENSE.md.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsdown.config.ts",
        templateFile: "templates/package/tsdown.config.ts.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/vitest.config.ts",
        templateFile: "templates/package/vitest.config.ts.hbs",
      },
    ],
  });

  // Config generator
  createGenerator(plop, "config", {
    directory: "configs",
    description: "Create a new config package in the configs directory",
    promptMessage: "What is the name of the config package?",
    additionalActions: [
      {
        type: "add",
        path: "configs/{{ path }}/src/index.ts",
        templateFile: "templates/config/src/index.ts.hbs",
      },
    ],
  });
}
