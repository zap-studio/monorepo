import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Ora } from 'ora';
import { ProcessExitError } from '@/lib/errors.js';

const execAsync = promisify(exec);

export async function formatFiles(
  projectDir: string,
  spinner: Ora
): Promise<void> {
  spinner.text = 'Formatting files...';
  spinner.start();

  try {
    await execAsync('npm run format', { cwd: projectDir });
    spinner.succeed('Files formatted.');
  } catch (error) {
    spinner.fail(`Failed to format files: ${String(error)}`);
    throw new ProcessExitError('Formatting files failed');
  }
}
