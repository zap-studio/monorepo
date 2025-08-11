#!/usr/bin/env node
import { Command } from 'commander';
import { createProcedure } from './commands/create-procedure.js';
import { createProject } from './commands/create-project.js';
import { generateEnv } from './commands/generate-env.js';
import { pluginCommand } from './commands/plugin.js';
import { displayWelcome, getPackageVersion } from './utils/cli/cli.js';

async function main() {
  try {
    const version = await getPackageVersion();
    const program = new Command();

    program
      .name('create-zap-app')
      .alias('zap')
      .description(
        'A CLI to bootstrap a Zap.ts project with plugins customization.'
      )
      .version(version || '1.0.0');

    program
      .command('create-zap-app')
      .description('Create a new Next.js project with Zap.ts boilerplate')
      .action(async () => {
        try {
          displayWelcome();
          await createProject();
        } catch (error) {
          process.stderr.write(`Failed to create project: ${error}\n`);
          process.exit(1);
        }
      });

    const createCmd = program
      .command('create')
      .description('Create various project components');

    createCmd
      .command('procedure')
      .description('Create a new oRPC procedure')
      .argument('<name>', 'Name of the procedure')
      .action(async (name: string) => {
        try {
          await createProcedure(name);
        } catch (error) {
          process.stderr.write(`Failed to create procedure: ${error}\n`);
          process.exit(1);
        }
      });

    const generateCmd = program
      .command('generate')
      .description('Generate various project files');

    generateCmd
      .command('env')
      .description('Generate environment variables for the project')
      .argument(
        '[filename]',
        'Name of the environment file (default: .env.template)'
      )
      .action(async (filename = '.env.template') => {
        try {
          await generateEnv(filename);
        } catch (error) {
          process.stderr.write(
            `Failed to generate environment file: ${error}\n`
          );
          process.exit(1);
        }
      });

    const pluginCmd = program
      .command('plugin')
      .description('Manage and run plugin scripts');

    pluginCmd
      .command('run')
      .description('Run a plugin script')
      .argument('<plugin>', 'Name of the plugin')
      .argument('<script>', 'Name of the script to run')
      .argument('[args...]', 'Additional arguments to pass to the script')
      .action(async (plugin: string, script: string, args: string[] = []) => {
        try {
          await pluginCommand('run', plugin, script, args);
        } catch (error) {
          process.stderr.write(`Failed to run plugin script: ${error}\n`);
          process.exit(1);
        }
      });

    pluginCmd
      .command('list')
      .description('List all plugins or scripts for a specific plugin')
      .argument('[plugin]', 'Name of the plugin to list scripts for')
      .action(async (plugin?: string) => {
        try {
          await pluginCommand('list', plugin);
        } catch (error) {
          process.stderr.write(`Failed to list plugins: ${error}\n`);
          process.exit(1);
        }
      });

    pluginCmd
      .command('scripts')
      .description('List all scripts from all plugins')
      .action(async () => {
        try {
          await pluginCommand('scripts');
        } catch (error) {
          process.stderr.write(`Failed to list scripts: ${error}\n`);
          process.exit(1);
        }
      });

    pluginCmd
      .command('validate')
      .description('Validate the plugin system')
      .action(async () => {
        try {
          await pluginCommand('validate');
        } catch (error) {
          process.stderr.write(`Failed to validate plugin system: ${error}\n`);
          process.exit(1);
        }
      });

    pluginCmd
      .command('deps')
      .description('Check plugin dependencies')
      .action(async () => {
        try {
          await pluginCommand('deps');
        } catch (error) {
          process.stderr.write(`Failed to check dependencies: ${error}\n`);
          process.exit(1);
        }
      });

    pluginCmd
      .command('generate')
      .description('Generate wrapper scripts for package.json')
      .action(async () => {
        try {
          await pluginCommand('generate');
        } catch (error) {
          process.stderr.write(`Failed to generate scripts: ${error}\n`);
          process.exit(1);
        }
      });

    program.action(async () => {
      try {
        displayWelcome();
        await createProject();
      } catch (error) {
        process.stderr.write(`Failed to create project: ${error}\n`);
        process.exit(1);
      }
    });

    program.parse(process.argv);

    process.on('SIGINT', () => {
      process.exit();
    });
  } catch (error) {
    process.stderr.write(`Failed to initialize CLI: ${error}\n`);
    process.exit(1);
  }
}

main();
