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
    console.log("Installing dependencies:", dependencies.join(" "));
    const installCommand = packageManagerCommands[packageManager].add;
    execSync(`${installCommand} ${dependencies.join(" ")}`, {
      stdio: "inherit",
    });
  }

  if (unusedDeps.length > 0) {
    console.log("Removing unused optional dependencies:", unusedDeps.join(" "));
    const removeCommand = packageManagerCommands[packageManager].remove;
    execSync(`${removeCommand} ${unusedDeps.join(" ")}`, { stdio: "inherit" });
  }
};
