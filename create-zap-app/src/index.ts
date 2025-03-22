#!/usr/bin/env node
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { exec } from "child_process";
import { promisify } from "util";
import type {
  ORM,
  PackageManager,
  PluginNames,
  PluginsMetadata,
  PluginMetadata,
} from "./schemas/index.js";
import plugins from "./plugins/index.js";
import {
  copyPluginFiles,
  generateExampleEnv,
  addPwaInit,
  addPwaSchemaExport,
  modifyAuth,
} from "./utils/index.js";
import { fileURLToPath } from "url";

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const execAsync = promisify(exec);

async function main() {
  console.log(
    chalk.bold.cyan(
      "\n🚀 Welcome to create-zap-app! Let’s build something awesome.\n"
    )
  );

  // Prompt for package manager
  const packageManagerResponse = await inquirer.prompt([
    {
      type: "list",
      name: "packageManager",
      message: chalk.yellow("Which package manager do you want to use?"),
      choices: ["npm", "yarn", "pnpm", "bun"],
    },
  ]);
  const packageManager =
    packageManagerResponse.packageManager as PackageManager;

  // Prompt for ORM
  const ormResponse = await inquirer.prompt([
    {
      type: "list",
      name: "orm",
      message: chalk.yellow("Which ORM do you want?"),
      choices: plugins
        .filter(
          (plugin: PluginMetadata) =>
            plugin.category === "orm" &&
            typeof plugin.available === "boolean" &&
            plugin.available
        )
        .map((plugin: PluginMetadata) => plugin.name),
    },
  ]);
  const orm = ormResponse.orm as ORM;

  // Prompt for plugins
  const pluginsResponse = await inquirer.prompt([
    {
      type: "checkbox",
      name: "plugins",
      message: chalk.yellow("Which plugins do you want?"),
      choices: plugins
        .filter(
          (plugin: PluginMetadata) =>
            (plugin.category !== "orm" &&
              typeof plugin.available === "boolean" &&
              plugin.available) ||
            (typeof plugin.available === "object" &&
              (orm === "drizzle-orm"
                ? plugin.available.drizzle
                : plugin.available.prisma))
        )
        .map((plugin: PluginMetadata) => plugin.name),
    },
  ]);
  const selectedPluginsName = pluginsResponse.plugins as PluginNames;

  // Get plugin metadata
  const ormPlugin = plugins.filter(
    (plugin: PluginMetadata) => plugin.name === orm
  )[0];
  const selectedPlugins: PluginsMetadata = plugins.filter(
    (plugin: PluginMetadata) => selectedPluginsName.includes(plugin.name)
  );

  // Get useful directory paths
  const outputDir = path.join(process.cwd(), "my-zap-app");
  const pluginsDir = path.join(__dirname, "./plugins");
  const coreDir = path.join(__dirname, "./core");

  // Create output directory
  await fs.ensureDir(outputDir);
  const spinner = ora("Setting up your project...").start();

  // Copy core files except plugins folder
  await fs.copy(coreDir, outputDir, {
    overwrite: false,
    filter: (src) => !src.includes(path.join(coreDir, "src/plugins")),
  });
  spinner.text = "Copied core files";

  // Determine required wrappers based on enabled plugins
  const pluginList: PluginsMetadata = [ormPlugin, ...selectedPlugins];
  const pluginListNames = pluginList.map(
    (plugin: PluginMetadata) => plugin.name
  );
  const requiredWrappers = new Set<string>();

  for (const plugin of pluginList) {
    requiredWrappers.add(plugin.name);
  }

  // Copy plugin wrappers from core/src/plugins/
  const pluginsSrcDir = path.join(coreDir, "src/plugins");
  const pluginsDestDir = path.join(outputDir, "src/plugins");
  await fs.ensureDir(pluginsDestDir);

  if (fs.existsSync(pluginsSrcDir)) {
    const pluginWrapperFiles = await fs.readdir(pluginsSrcDir, {
      withFileTypes: true,
    });

    for (const file of pluginWrapperFiles) {
      if (!file.isFile()) continue;

      const wrapperName = file.name.replace(".ts", "");

      if (requiredWrappers.has(wrapperName)) {
        const srcPath = path.join(pluginsSrcDir, file.name);
        const destPath = path.join(pluginsDestDir, file.name);

        await fs.copy(srcPath, destPath, { overwrite: true });

        spinner.clear();
        spinner.text = `Copied wrapper for ${wrapperName}`;
      }
    }
  }

  // Aggregate dependencies
  const dependencies = new Set<string>();
  const devDependencies = new Set<string>();

  // Process each plugin
  for (const plugin of pluginList) {
    const pluginPath = path.join(pluginsDir, plugin.name);

    if (!fs.existsSync(pluginPath)) {
      spinner.fail(`Plugin ${plugin} not found`);
      process.exit(1);
    }

    spinner.clear();
    spinner.text = `Processing plugin: ${plugin}`;

    // Copy every files from the plugin folder
    await copyPluginFiles(pluginPath, outputDir, spinner, orm);

    // Add dependencies
    if (plugin.dependencies) {
      plugin.dependencies.forEach((dep: string) => dependencies.add(dep));
    }
  }

  // Merge package.json
  const outputPkgPath = path.join(outputDir, "package.json");
  const outputPkg = await fs.readJson(outputPkgPath);

  const depEntries = Array.from(dependencies).map((dep) => {
    const atIndex = dep.lastIndexOf("@");
    if (atIndex > 0) {
      const name = dep.slice(0, atIndex);
      const version = dep.slice(atIndex + 1);
      return [name, version];
    }
    return [dep, "latest"];
  });

  const devDepEntries = Array.from(devDependencies).map((dep) => {
    const atIndex = dep.lastIndexOf("@");
    if (atIndex > 0) {
      const name = dep.slice(0, atIndex);
      const version = dep.slice(atIndex + 1);
      return [name, version];
    }
    return [dep, "latest"];
  });

  outputPkg.dependencies = {
    ...outputPkg.dependencies,
    ...Object.fromEntries(depEntries),
  };
  outputPkg.devDependencies = {
    ...outputPkg.devDependencies,
    ...Object.fromEntries(devDepEntries),
  };
  await fs.writeJson(outputPkgPath, outputPkg, { spaces: 2 });

  // Modify providers.tsx to add plugin initializations (e.g., initPwa)
  spinner.clear();
  spinner.text =
    "Configuring providers, index.tsx, and auth-server.ts files...";
  const isPwaEnabled = selectedPluginsName.includes("pwa");
  const isDrizzleEnabled = orm === "drizzle-orm";
  await addPwaInit(outputDir, isPwaEnabled);
  await addPwaSchemaExport(outputDir, isDrizzleEnabled, isPwaEnabled);
  await modifyAuth(outputDir, pluginListNames);

  // Install dependencies
  spinner.clear();
  spinner.text = "Installing dependencies...";
  const installCmd =
    packageManager === "npm"
      ? "npm install --force"
      : packageManager === "yarn"
        ? "yarn"
        : packageManager === "pnpm"
          ? "pnpm install --force"
          : "bun install";
  await execAsync(installCmd, { cwd: outputDir });

  // After installing dependencies
  spinner.clear();
  spinner.text = "Ensuring executable permissions...";
  await execAsync("chmod -R u+x node_modules/.bin/*", { cwd: outputDir });

  // Update dependencies
  spinner.clear();
  spinner.text = "Updating dependencies...";
  await execAsync(`${packageManager} update`, { cwd: outputDir });

  // Run prettier on the project
  spinner.clear();
  spinner.text = "Running Prettier on the project...";
  await execAsync(`${packageManager} run format`, { cwd: outputDir });

  // Generate .env.local file
  spinner.clear();
  spinner.text = "Generating .env.local file...";
  await generateExampleEnv(outputDir, selectedPluginsName);

  spinner.succeed("Project setup complete!");

  console.log(chalk.bold.green("\n🎉 Project created successfully!"));
  console.log("");
  console.log(chalk.cyan("Get started:"));
  console.log(chalk.white(`  cd ${path.basename(outputDir)}`));
  console.log(chalk.white(`  ${packageManager} dev\n`));
}

main().catch((error) => {
  console.error(chalk.bold.red("\n❌ An error occurred:"), error.message);
  process.exit(1);
});
