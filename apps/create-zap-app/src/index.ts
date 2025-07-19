#!/usr/bin/env node
import { Command } from 'commander';
import { Effect, Exit } from 'effect';
import {
  createProcedureEffect,
  createProjectEffect,
} from '@/commands/index.js';
import { displayWelcome, getPackageVersion } from '@/utils/cli.js';

async function main(): Promise<void> {
  const version = await getPackageVersion();

  const program = new Command();

  program
    .name('create-zap-app')
    .description(
      'A CLI to bootstrap a Next.js boilerplate with plugins customization.'
    )
    .version(version);

  program
    .command('create-zap-app')
    .alias('new')
    .description('Create a new Next.js project with Zap.ts boilerplate')
    .action(async () => {
      displayWelcome();
      const exit = await Effect.runPromiseExit(createProjectEffect());

      if (Exit.isFailure(exit)) {
        process.exit(1);
      }
    });

  program
    .command('create-procedure')
    .alias('procedure')
    .description('Create a new oRPC procedure')
    .argument('<name>', 'Name of the procedure')
    .action(async (name: string) => {
      const exit = await Effect.runPromiseExit(createProcedureEffect(name));

      if (Exit.isFailure(exit)) {
        process.exit(1);
      }
    });

  program.action(async () => {
    displayWelcome();
    const exit = await Effect.runPromiseExit(createProjectEffect());

    if (Exit.isFailure(exit)) {
      process.exit(1);
    }
  });

  program.parse(process.argv);

  process.on('SIGINT', () => {
    process.exit();
  });
}

main().catch((error) => {
  process.stderr.write(`Failed to start CLI: ${error}\n`);
  process.exit(1);
});
