#!/usr/bin/env node
import { Command } from 'commander';
import { Effect, Exit, pipe } from 'effect';
import { createProcedureEffect } from './commands/create-procedure.js';
import { createProjectEffect } from './commands/create-project.js';
import { generateEnvEffect } from './commands/generate-env.js';
import { displayWelcome, getPackageVersion } from './utils/cli/cli.js';

const main = pipe(
  getPackageVersion(),
  Effect.tap((version) => {
    const program = new Command();

    program
      .name('create-zap-app')
      .alias('zap')
      .description(
        'A CLI to bootstrap a Zap.ts project with plugins customization.'
      )
      .version(version);

    program
      .command('create-zap-app')
      .alias('new')
      .description('Create a new Next.js project with Zap.ts boilerplate')
      .action(() => {
        displayWelcome();
        Effect.runPromiseExit(createProjectEffect()).then((exit) => {
          if (Exit.isFailure(exit)) {
            process.stderr.write(`Failed to create project: ${exit.cause}\n`);
            process.exit(1);
          }
        });
      });

    program
      .command('create-procedure')
      .alias('procedure')
      .description('Create a new oRPC procedure')
      .argument('<name>', 'Name of the procedure')
      .action((name: string) => {
        Effect.runPromiseExit(createProcedureEffect(name)).then((exit) => {
          if (Exit.isFailure(exit)) {
            process.stderr.write(`Failed to create procedure: ${exit.cause}\n`);
            process.exit(1);
          }
        });
      });

    program
      .command('generate-env')
      .description('Generate environment variables for the project')
      .argument(
        '[filename]',
        'Name of the environment file (default: .env.template)'
      )
      .action((filename = '.env.template') => {
        Effect.runPromiseExit(generateEnvEffect(filename)).then((exit) => {
          if (Exit.isFailure(exit)) {
            process.stderr.write(
              `Failed to generate environment file: ${exit.cause}\n`
            );
            process.exit(1);
          }
        });
      });

    program.action(() => {
      displayWelcome();
      Effect.runPromiseExit(createProjectEffect()).then((exit) => {
        if (Exit.isFailure(exit)) {
          process.stderr.write(`Failed to create project: ${exit.cause}\n`);
          process.exit(1);
        }
      });
    });

    program.parse(process.argv);

    process.on('SIGINT', () => {
      process.exit();
    });
  })
);

Effect.runPromise(main);
