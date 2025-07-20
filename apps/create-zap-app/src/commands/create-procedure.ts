import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { Effect } from 'effect';
import ora from 'ora';
import {
  generateHookFile,
  generateProcedureFile,
  toKebabCase,
  updateRouterFile,
  validateProcedureName,
} from '@/utils/commands/procedure';

const execAsync = promisify(exec);

/**
 * Creates a new RPC procedure with associated files and configuration.
 *
 * This function orchestrates the creation of a complete RPC procedure by:
 * 1. Validating the procedure name format
 * 2. Converting the name to appropriate formats (kebab-case, PascalCase)
 * 3. Generating the RPC procedure file
 * 4. Updating the router configuration
 * 5. Creating a React hook for client-side usage
 * 6. Formatting all generated files
 *
 * @param procedureName - The name of the procedure to create (must be camelCase, alphanumeric)
 * @returns An Effect that resolves when all files are successfully created and configured
 *
 * @throws {Error} If the procedure name is invalid or any file operations fail
 *
 * @example
 * ```typescript
 * // Create a new procedure
 * const effect = createProcedureEffect("getUserData");
 *
 * // Run the effect
 * Effect.runPromise(effect).then(() => {
 *   console.log("Procedure created successfully!");
 * }).catch(console.error);
 *
 * // This will create:
 * // - src/rpc/procedures/get-user-data.rpc.ts
 * // - src/hooks/use-get-user-data.ts
 * // - Updates src/rpc/router.ts
 * ```
 */
export function createProcedureEffect(
  procedureName: string
): Effect.Effect<void, Error, never> {
  return Effect.gen(function* (_) {
    const projectDir = process.cwd();
    const spinner = ora(`Creating procedure ${procedureName}...`).start();

    const validatedName = yield* _(
      Effect.try({
        try: () => validateProcedureName(procedureName),
        catch: (error) =>
          error instanceof Error ? error : new Error(String(error)),
      })
    );
    const kebabCaseName = yield* _(
      Effect.try({
        try: () => toKebabCase(validatedName),
        catch: (error) =>
          error instanceof Error ? error : new Error(String(error)),
      })
    );

    yield* _(
      Effect.catchAll(
        generateProcedureFile(projectDir, validatedName, kebabCaseName),
        (error) => {
          spinner.fail(`Failed to create procedure file: ${String(error)}`);
          process.exit(1);
        }
      )
    );
    spinner.succeed(`Created ${kebabCaseName}.rpc.ts`);

    yield* _(
      Effect.catchAll(
        updateRouterFile(projectDir, validatedName, kebabCaseName),
        (error) => {
          spinner.fail(`Failed to update router: ${String(error)}`);
          process.exit(1);
        }
      )
    );
    process.stdout.write(chalk.green('Updated router.ts'));

    yield* _(
      Effect.catchAll(
        generateHookFile(projectDir, validatedName, kebabCaseName),
        (error) => {
          spinner.fail(`Failed to create hook file: ${String(error)}`);
          process.exit(1);
        }
      )
    );
    process.stdout.write(chalk.green(`Created use-${kebabCaseName}.ts`));

    spinner.text = 'Formatting files...';
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () => execAsync('npm run format', { cwd: projectDir }),
        catch: (e) => {
          spinner.fail(`Failed to format files: ${String(e)}`);
          process.exit(1);
        },
      })
    );
    spinner.succeed('Files formatted.');

    process.stdout.write(
      chalk.green(`Successfully created ${validatedName} procedure!`)
    );
    process.stdout.write(chalk.cyan('\nFiles created:'));
    process.stdout.write(
      chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts`)
    );
    process.stdout.write(chalk.white(`- src/hooks/use-${kebabCaseName}.ts`));
    process.stdout.write(chalk.white('\nRouter updated:'));
    process.stdout.write(chalk.white('- src/rpc/router.ts'));
  }).pipe(
    Effect.mapError((error) => new Error(String(error)))
  ) as Effect.Effect<void, Error, never>;
}
