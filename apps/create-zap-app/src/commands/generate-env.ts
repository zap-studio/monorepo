import chalk from 'chalk';
import { Effect } from 'effect';
import ora from 'ora';
import { generateEnv } from '@/utils/generation/generate-env.js';

/**
 * Creates a new environment file with all required variables for the Zap.ts project.
 *
 * This function generates an environment file containing all the environment variables
 * used throughout the Zap.ts application. It provides sensible defaults and comments
 * to help users understand what each variable is for.
 *
 * @param filename - The name of the environment file to create
 * @returns An Effect that resolves when the file is successfully created
 *
 * @throws {Error} If the file cannot be written
 *
 * @example
 * ```typescript
 * // Generate default .env.template
 * const effect = generateEnvEffect();
 *
 * // Generate custom filename
 * const customEffect = generateEnvEffect(".env.local");
 *
 * // Run the effect
 * Effect.runPromise(effect).then(() => {
 *   // Environment file created successfully
 * }).catch(console.error);
 * ```
 */
export function generateEnvEffect(
  filename = '.env.template'
): Effect.Effect<void, Error, never> {
  return Effect.gen(function* () {
    const spinner = ora('Generating environment file...').start();

    try {
      const outputDir = process.cwd();
      const isTemplate =
        filename.includes('template') || filename.includes('example');

      // Use the shared utility function
      yield* Effect.tryPromise({
        try: () => generateEnv(outputDir, filename, isTemplate),
        catch: (error) => {
          spinner.fail('Failed to generate environment file');
          return new Error(
            `Failed to write environment file: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        },
      });

      spinner.succeed(
        `Environment file generated successfully: ${chalk.green(filename)}`
      );

      // Provide helpful information to the user
      process.stdout.write(`\n${chalk.blue('📋 Next steps:')}`);
      process.stdout.write(
        `\n1. Review and customize the variables in ${chalk.cyan(filename)}`
      );
      process.stdout.write(
        `\n2. Copy ${chalk.cyan(filename)} to ${chalk.cyan('.env')} or ${chalk.cyan('.env.local')}`
      );
      process.stdout.write(
        '\n3. Fill in the actual values for your environment'
      );
      process.stdout.write(
        '\n4. Add your environment file to .gitignore if it contains sensitive data'
      );

      process.stdout.write(`\n\n${chalk.yellow('⚠️  Important:')}`);
      process.stdout.write(
        '\n• Required variables are uncommented and must be set'
      );
      process.stdout.write(
        '\n• Optional variables are commented out with # prefix'
      );
      process.stdout.write(
        '\n• Never commit files containing real secrets to version control\n'
      );
    } catch (error) {
      spinner.fail('Failed to generate environment file');
      yield* Effect.fail(
        new Error(
          `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  });
}
