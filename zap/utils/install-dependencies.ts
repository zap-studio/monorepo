import { execSync } from "child_process";
import { packageManagerCommands } from "./package-manager-commands";
import { z } from "zod";
import { plugins } from "../plugins-list";

export const PackageManagerSchema = z.enum(["npm", "yarn", "pnpm", "bun"]);
export type PackageManager = z.infer<typeof PackageManagerSchema>;

export const installDependencies = async (
  packageManager: PackageManager,
  selectedPlugins: string[],
) => {
  const dependencies = selectedPlugins
    .flatMap((name) => {
      const plugin = plugins.find((p) => p.name === name);
      return plugin?.dependencies || [];
    })
    .filter((dep, index, self) => self.indexOf(dep) === index);

  const allOptionalDeps = plugins
    .flatMap((p) => p.dependencies || [])
    .filter((dep, index, self) => self.indexOf(dep) === index);

  const unusedDeps = allOptionalDeps.filter(
    (dep) => !dependencies.includes(dep),
  );

  if (dependencies.length > 0) {
    const installCommand = packageManagerCommands[packageManager].add;

    try {
      execSync(`${installCommand} ${dependencies.join(" ")}`, {
        stdio: "ignore",
      });
    } catch {
      console.error("Failed to install dependencies. Please check manually.");
    }
  }

  if (unusedDeps.length > 0) {
    const removeCommand = packageManagerCommands[packageManager].remove;

    try {
      execSync(`${removeCommand} ${unusedDeps.join(" ")}`, { stdio: "ignore" });
    } catch {
      console.error(
        "Failed to remove optional unused dependencies. Please check manually.",
      );
    }
  }

  console.log("Dependencies installed successfully.");
};
