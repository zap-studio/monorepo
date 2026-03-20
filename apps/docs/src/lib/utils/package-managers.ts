const WHITESPACE_REGEX = /\s+/;

type InstallPackageManager = "yarn" | "pnpm" | "bun";

function convertInstallCommand(command: string, pm: InstallPackageManager): string | undefined {
  if (command.startsWith("npm install ")) {
    const pkg = command.slice("npm install ".length);
    if (pm === "yarn") {
      return `yarn add ${pkg}`;
    }
    if (pm === "pnpm") {
      return `pnpm add ${pkg}`;
    }
    return `bun add ${pkg}`;
  }

  if (command.startsWith("npx ")) {
    const pkg = command.slice("npx ".length);
    if (pm === "yarn") {
      return `yarn dlx ${pkg}`;
    }
    if (pm === "pnpm") {
      return `pnpm dlx ${pkg}`;
    }
    return `bunx ${pkg}`;
  }

  return undefined;
}

function convertToDeno(command: string): string | undefined {
  if (!command.startsWith("npm install ")) {
    return undefined;
  }

  const packages = command.slice("npm install ".length).trim().split(WHITESPACE_REGEX);
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
}

function convertToNpm(command: string): string | undefined {
  if (command.startsWith("npm ") || command.startsWith("npx ")) {
    return command;
  }
  return undefined;
}

export const remarkNpmPackageManagers = [
  {
    name: "npm",
    command: convertToNpm,
  },
  {
    name: "yarn",
    command: (command: string) => convertInstallCommand(command, "yarn"),
  },
  {
    name: "pnpm",
    command: (command: string) => convertInstallCommand(command, "pnpm"),
  },
  {
    name: "bun",
    command: (command: string) => convertInstallCommand(command, "bun"),
  },
  {
    name: "deno",
    command: convertToDeno,
  },
];
