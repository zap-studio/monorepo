#!/usr/bin/env node
import { Effect } from 'effect';
import {
  createProcedureEffect,
  createProjectEffect,
} from './commands/index.js';
import { displayError, displayUsage } from './utils/cli.js';

// CLI entry point
async function run() {
  const args = process.argv.slice(2);

  if (args[0] === 'create' && args[1] === 'procedure' && args[2]) {
    await Effect.runPromise(createProcedureEffect(args[2]));
  } else if (args.length === 0) {
    await Effect.runPromise(createProjectEffect()).catch((error) => {
      displayError(error);
      process.exit(1);
    });
  } else {
    displayUsage();
    process.exit(1);
  }
}

run();
