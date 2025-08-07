import chalk from 'chalk';
import ora from 'ora';
import { displayNextSteps } from '@/utils/cli/cli';
import { generateEnv as generateEnvironment } from '@/utils/generation/generate-env.js';

export async function generateEnv(filename = '.env.template') {
  const spinner = ora('Generating environment file...').start();
  const outputDir = process.cwd();

  try {
    await generateEnvironment({ outputDir, filename });
    spinner.text = `Environment file ${chalk.green(filename)} generated successfully`;
    spinner.succeed();

    displayNextSteps(filename);
  } catch (error) {
    spinner.fail('Failed to generate environment file');
    throw new Error(`Failed to write environment file: ${error}`);
  }
}
