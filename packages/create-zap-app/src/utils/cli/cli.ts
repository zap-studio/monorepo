import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs-extra';
import { packageJsonSchema } from '@/schemas/package-json.schema.js';

export async function getPackageVersion(): Promise<string | undefined> {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf8');

    const rawPkg = JSON.parse(content);
    const pkg = packageJsonSchema.parse(rawPkg);
    return pkg.version;
  } catch (error) {
    process.stderr.write(`Failed to read package version: ${error}`);
    return;
  }
}

export function displayWelcome(): void {
  const banner = figlet.textSync('Zap.ts', {
    font: 'ANSI Shadow',
  });

  process.stdout.write('\x1B[2J\x1B[0f\n');
  process.stdout.write(
    chalk.bold.cyan(banner) +
      chalk.bold.cyan(
        "\n🚀 Welcome to create-zap-app! Let's build something awesome.\n"
      )
  );
}

export function displayNextSteps(filename: string): void {
  process.stdout.write(`\n${chalk.blue('📋 Next steps:')}`);
  process.stdout.write(
    `\n1. Review and customize the variables in ${chalk.cyan(filename)}`
  );
  process.stdout.write(
    `\n2. Copy ${chalk.cyan(filename)} to ${chalk.cyan('.env')} or ${chalk.cyan('.env.local')}`
  );
  process.stdout.write('\n3. Fill in the actual values for your environment');
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
}
