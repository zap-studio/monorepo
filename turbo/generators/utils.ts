import type { PlopTypes } from "@turbo/gen";

const VALID_PACKAGE_NAME_REGEX = /^[a-z0-9-]+$/;
const VALID_PATH_SEGMENT_REGEX = /^[a-z0-9-/]+$/;

const validateSegment = (segment: string): string | true => {
  if (segment.length === 0) {
    return "Package path cannot have empty segments";
  }
  if (!VALID_PACKAGE_NAME_REGEX.test(segment)) {
    return "Each path segment must contain only lowercase letters, numbers, and hyphens";
  }
  if (segment.startsWith("-") || segment.endsWith("-")) {
    return "Path segments cannot start or end with a hyphen";
  }
  return true;
};

const validateNestedPackagePath = (input: string): string | true => {
  if (!VALID_PATH_SEGMENT_REGEX.test(input)) {
    return "Package path must contain only lowercase letters, numbers, hyphens, and forward slashes";
  }

  const segments = input.split("/");
  for (const segment of segments) {
    const result = validateSegment(segment);
    if (result !== true) {
      return result;
    }
  }
  return true;
};

const validateSinglePackageName = (input: string): string | true => {
  if (!VALID_PACKAGE_NAME_REGEX.test(input)) {
    return "Package name must contain only lowercase letters, numbers, and hyphens";
  }
  if (input.startsWith("-") || input.endsWith("-")) {
    return "Package name cannot start or end with a hyphen";
  }
  return true;
};

const validatePackageName = (input: string): string | true => {
  if (input.length === 0) {
    return "Package name is required";
  }
  if (input.includes(" ")) {
    return "Package name cannot include spaces";
  }

  if (input.includes("/")) {
    return validateNestedPackagePath(input);
  }

  return validateSinglePackageName(input);
};

const createStandardActions = (
  directory: string,
  templateDir: string,
  additionalActions: PlopTypes.ActionType[] = []
): PlopTypes.ActionType[] => {
  const basePath = `${directory}/{{ path }}`;
  const standardActions: PlopTypes.ActionType[] = [
    {
      type: "add",
      path: `${basePath}/.gitignore`,
      templateFile: `templates/${templateDir}/.gitignore.hbs`,
    },
    {
      type: "add",
      path: `${basePath}/package.json`,
      templateFile: `templates/${templateDir}/package.json.hbs`,
    },
    {
      type: "add",
      path: `${basePath}/tsconfig.json`,
      templateFile: `templates/${templateDir}/tsconfig.json.hbs`,
    },
  ];

  return [...standardActions, ...additionalActions];
};

interface GeneratorConfig {
  directory: string;
  description: string;
  promptMessage: string;
  additionalActions?: PlopTypes.ActionType[];
}

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
        transformer: (input: string) => {
          // Show a helpful example in the prompt
          return input || "e.g., 'my-package' or 'package/package-core'";
        },
      },
    ],
    actions: (data) => {
      if (!data) {
        return [];
      }

      // Extract package name and path
      const nameInput = data.name as string;
      const segments = nameInput.split("/");
      const packageName = segments.at(-1);

      // Add computed values to data
      data.path = nameInput; // Full path (e.g., "package/package-core" or "my-package")
      data.packageName = packageName; // Last segment (e.g., "package-core" or "my-package")

      return createStandardActions(
        config.directory,
        name,
        config.additionalActions
      );
    },
  });
};
