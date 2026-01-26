import type { PlopTypes } from "@turbo/gen";
import { createGenerator } from "./utils";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Package generator
  const packageBasePath = "packages/{{ name }}";
  const packageTemplateBase = "templates/package";
  createGenerator(plop, "package", {
    directory: "packages",
    description: "Create a new package in the packages directory",
    promptMessage:
      "What is the name of the package? (e.g., 'my-package' or 'package/package-core')",
    additionalActions: [
      {
        type: "add",
        path: `${packageBasePath}/src/index.ts`,
        templateFile: `${packageTemplateBase}/src/index.ts.hbs`,
      },
      {
        type: "add",
        path: `${packageBasePath}/jsr.json`,
        templateFile: `${packageTemplateBase}/jsr.json.hbs`,
      },
      {
        type: "add",
        path: `${packageBasePath}/LICENSE`,
        templateFile: `${packageTemplateBase}/LICENSE.hbs`,
      },
      {
        type: "add",
        path: `${packageBasePath}/tsdown.config.ts`,
        templateFile: `${packageTemplateBase}/tsdown.config.ts.hbs`,
      },
      {
        type: "add",
        path: `${packageBasePath}/vitest.config.ts`,
        templateFile: `${packageTemplateBase}/vitest.config.ts.hbs`,
      },
      {
        type: "add",
        path: `${packageBasePath}/tests/index.test.ts`,
        templateFile: `${packageTemplateBase}/tests/index.test.ts.hbs`,
      },
    ],
  });

  // Config generator
  const configBasePath = "configs/{{ name }}";
  const configTemplateBase = "templates/config";
  createGenerator(plop, "config", {
    directory: "configs",
    description: "Create a new config package in the configs directory",
    promptMessage: "What is the name of the config package?",
    additionalActions: [
      {
        type: "add",
        path: `${configBasePath}/src/index.ts`,
        templateFile: `${configTemplateBase}/src/index.ts.hbs`,
      },
    ],
  });
}
