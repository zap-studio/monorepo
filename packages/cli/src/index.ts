#!/usr/bin/env node
import { Command } from "commander";
import { createProcedure } from "./commands/create-procedure.js";
import { generateEnv } from "./commands/generate-env.js";
import { getPackageVersion } from "./utils/cli/cli.js";
import { summarizePlugins } from "./utils/debug/summarize-plugins.js";

async function main() {
  try {
    const version = await getPackageVersion();
    const program = new Command();

    program
      .name("zap")
      .description("The CLI for managing Zap.ts projects.")
      .version(version || "1.0.0");

    program
      .command("debug")
      .description("Debug utilities for Zap.ts projects")
      .command("plugins")
      .description("Get a summary of plugins architecture in template/")
      .option("-o, --output <file>", "Output the summary to a file")
      .action(async (options) => {
        try {
          await summarizePlugins(options);
        } catch (error) {
          process.stderr.write(`Failed to summarize plugins: ${error}\n`);
          process.exit(1);
        }
      });

    const createCmd = program
      .command("create")
      .description("Create various project components");

    createCmd
      .command("procedure")
      .description("Create a new oRPC procedure")
      .argument("<name>", "Name of the procedure")
      .action(async (name: string) => {
        try {
          await createProcedure(name);
        } catch (error) {
          process.stderr.write(`Failed to create procedure: ${error}\n`);
          process.exit(1);
        }
      });

    const generateCmd = program
      .command("generate")
      .description("Generate various project files");

    generateCmd
      .command("env")
      .description("Generate environment variables for the project")
      .argument(
        "[filename]",
        "Name of the environment file (default: .env.template)"
      )
      .action(async (filename = ".env.template") => {
        try {
          await generateEnv(filename);
        } catch (error) {
          process.stderr.write(
            `Failed to generate environment file: ${error}\n`
          );
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
