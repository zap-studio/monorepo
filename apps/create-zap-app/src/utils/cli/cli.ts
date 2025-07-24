import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { Console, Effect } from 'effect';
import figlet from 'figlet';
import { joinPathEffect, readFileEffect } from '..';

export function getPackageVersion() {
  const program = Effect.gen(function* () {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const packageJsonPath = yield* joinPathEffect(
      __dirname,
      '..',
      'package.json'
    );
    const content = yield* readFileEffect(packageJsonPath, 'utf8');

    const pkg = JSON.parse(content);
    return pkg.version;
  });

  return program;
}

export const displayWelcome = Effect.gen(function* () {
  const banner = figlet.textSync('Zap.ts', {
    font: 'ANSI Shadow',
  });

  yield* Console.log('\x1B[2J\x1B[0f\n');
  yield* Console.log(
    chalk.bold.cyan(banner) +
      chalk.bold.cyan(
        "\n🚀 Welcome to create-zap-app! Let's build something awesome.\n"
      )
  );
});

export const displayNextSteps = (filename: string) => {
  Console.log(`\n${chalk.blue('📋 Next steps:')}`);
  Console.log(
    `\n1. Review and customize the variables in ${chalk.cyan(filename)}`
  );
  Console.log(
    `\n2. Copy ${chalk.cyan(filename)} to ${chalk.cyan('.env')} or ${chalk.cyan('.env.local')}`
  );
  Console.log('\n3. Fill in the actual values for your environment');
  Console.log(
    '\n4. Add your environment file to .gitignore if it contains sensitive data'
  );

  Console.log(`\n\n${chalk.yellow('⚠️  Important:')}`);
  Console.log('\n• Required variables are uncommented and must be set');
  Console.log('\n• Optional variables are commented out with # prefix');
  Console.log(
    '\n• Never commit files containing real secrets to version control\n'
  );
};
