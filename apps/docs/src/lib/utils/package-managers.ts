const WHITESPACE_REGEX = /\s+/u;

type InstallPackageManager = "yarn" | "pnpm" | "bun";

const installCommands = {
  bun: "bun add",
  pnpm: "pnpm add",
  yarn: "yarn add",
} satisfies Record<InstallPackageManager, string>;

const executeCommands = {
  bun: "bunx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
} satisfies Record<InstallPackageManager, string>;

const convertInstallCommand = (
  command: string,
  pm: InstallPackageManager
): string | undefined => {
  if (command.startsWith("npm install ")) {
    return `${installCommands[pm]} ${command.slice("npm install ".length)}`;
  }

  if (command.startsWith("npx ")) {
    return `${executeCommands[pm]} ${command.slice("npx ".length)}`;
  }

  return undefined;
};

const convertToDeno = (command: string): string | undefined => {
  if (!command.startsWith("npm install ")) {
    return undefined;
  }

  const packages = command
    .slice("npm install ".length)
    .trim()
    .split(WHITESPACE_REGEX);
  if (!packages.length) {
    return undefined;
  }

  const converted = packages.map((pkg) => {
    if (pkg.startsWith("@zap-studio/")) {
      return `jsr:${pkg}`;
    }
    return `npm:${pkg}`;
  });

  return `deno add ${converted.join(" ")}`;
};

const convertToNpm = (command: string): string | undefined => {
  if (command.startsWith("npm ") || command.startsWith("npx ")) {
    return command;
  }
  return undefined;
};

export const remarkNpmPackageManagers = [
  {
    command: convertToNpm,
    name: "npm",
  },
  {
    command: (command: string) => convertInstallCommand(command, "yarn"),
    name: "yarn",
  },
  {
    command: (command: string) => convertInstallCommand(command, "pnpm"),
    name: "pnpm",
  },
  {
    command: (command: string) => convertInstallCommand(command, "bun"),
    name: "bun",
  },
  {
    command: convertToDeno,
    name: "deno",
  },
];
