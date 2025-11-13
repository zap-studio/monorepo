import type { PlopTypes } from "@turbo/gen";
import { createGenerator } from "./utils";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Package generator
  createGenerator(plop, "package", {
    directory: "packages",
    description: "Create a new package in the packages directory",
    promptMessage: "What is the name of the package?",
    additionalActions: [
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        templateFile: "templates/package/src/index.ts.hbs",
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
        path: "configs/{{ name }}/src/index.ts",
        templateFile: "templates/config/src/index.ts.hbs",
      },
    ],
  });
}
