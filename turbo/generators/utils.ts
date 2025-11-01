import type { PlopTypes } from "@turbo/gen";

const VALID_PACKAGE_NAME_REGEX = /^[a-z0-9-]+$/;

const validatePackageName = (input: string): string | true => {
  if (input.length === 0) {
    return "Package name is required";
  }
  if (input.includes(" ")) {
    return "Package name cannot include spaces";
  }
  if (!VALID_PACKAGE_NAME_REGEX.test(input)) {
    return "Package name must contain only lowercase letters, numbers, and hyphens";
  }
  if (input.startsWith("-") || input.endsWith("-")) {
    return "Package name cannot start or end with a hyphen";
  }
  return true;
};

const createStandardActions = (
  directory: string,
  templateDir: string,
  additionalActions: PlopTypes.ActionType[] = []
): PlopTypes.ActionType[] => {
  const standardActions: PlopTypes.ActionType[] = [
    {
      type: "add",
      path: `${directory}/{{ name }}/package.json`,
      templateFile: `templates/${templateDir}/package.json.hbs`,
    },
    {
      type: "add",
      path: `${directory}/{{ name }}/tsconfig.json`,
      templateFile: `templates/${templateDir}/tsconfig.json.hbs`,
    },
    {
      type: "add",
      path: `${directory}/{{ name }}/.gitignore`,
      templateFile: `templates/${templateDir}/.gitignore.hbs`,
    },
  ];

  return [...standardActions, ...additionalActions];
};

type GeneratorConfig = {
  directory: string;
  description: string;
  promptMessage: string;
  additionalActions?: PlopTypes.ActionType[];
};

export const createGenerator = (
  plop: PlopTypes.NodePlopAPI,
  name: string,
  config: GeneratorConfig
): void => {
  plop.setGenerator(name, {
    description: config.description,
    prompts: [
      {
        type: "input",
        name: "name",
        message: config.promptMessage,
        validate: validatePackageName,
      },
    ],
    actions: createStandardActions(
      config.directory,
      name,
      config.additionalActions
    ),
  });
};
