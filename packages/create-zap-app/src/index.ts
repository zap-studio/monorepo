#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from "./commands/create-project.js";
import { displayWelcome, getPackageVersion } from "./utils/cli/messages.js";
import { getErrorMessage } from "./utils/misc/error.js";

async function main() {
  try {
    const version = await getPackageVersion();
    const program = new Command();

    program
      .name("create-zap-app")
      .description(
        "A CLI to bootstrap a Zap.ts project with plugins customization."
      )
      .version(version || "1.0.0");

    program
      .description("Create a new Next.js project with Zap.ts boilerplate")
      .option("-n, --name <projectName>", "Name of the project")
      .option(
        "-d, --directory <directory>",
        "Directory to create the project in"
      )
      .option(
        "-p, --package-manager <packageManager>",
        "Package manager to use (npm, yarn, pnpm, bun)"
      )
      .option("-i, --ide <ide>", "IDE to use (vscode, windsurf, zed, cursor)")
      .option(
        "-l, --plugins <plugins>",
        "Comma-separated list of plugins to install (e.g. waitlist, feedbacks)"
      )
      .option("--verbose", "Enable verbose output")
      .action(async (opts) => {
        try {
          displayWelcome();
          await createProject({
            projectName: opts.name,
            directory: opts.directory,
            packageManager: opts.packageManager,
            ide: opts.ide,
            plugins: opts.plugins,
            verbose: opts.verbose,
          });
        } catch (error) {
          process.stderr.write("Failed to create project.\n");
          if (opts.verbose) {
            process.stderr.write(`${getErrorMessage(error)}\n`);
          }
          process.exit(1);
        }
      });

    program.parse(process.argv);

    process.on("SIGINT", () => {
      process.exit();
    });
  } catch (error) {
    process.stderr.write(`Failed to initialize CLI: ${error}\n`);
    process.exit(1);
  }
}

main();
