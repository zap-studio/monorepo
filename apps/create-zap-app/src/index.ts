#!/usr/bin/env node
import { Command } from 'commander';
import { Console, Effect, Exit, pipe } from 'effect';
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
      .description(
        'A CLI to bootstrap a Zap.ts project with plugins customization.'
      )
      .version(version);

    program
      .command('create-zap-app')
      .alias('new')
      .description('Create a new Next.js project with Zap.ts boilerplate')
      .action(() => {
        Effect.runSync(displayWelcome);
        Effect.runPromiseExit(createProjectEffect()).then((exit) => {
          if (Exit.isFailure(exit)) {
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
            process.exit(1);
          }
        });
      });

    program.action(() => {
      Effect.runSync(displayWelcome);
      Effect.runPromiseExit(createProjectEffect()).then((exit) => {
        if (Exit.isFailure(exit)) {
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

Effect.runPromise(main).catch((error) => {
  Console.log(`An error occurred: ${error}`);
  process.exit(1);
});
