import { execa } from 'execa';
import fs from 'fs-extra';
import { ProcessExitError } from '@/lib/errors.js';

export async function extractTemplate(
  outputDir: string,
  tarballPath: string
): Promise<void> {
  try {
    await execa('tar', [
      '-xzf',
      tarballPath,
      '-C',
      outputDir,
      '--strip-components=1',
    ]);
    await fs.remove(tarballPath);
  } catch (error) {
    throw new ProcessExitError(`Failed to extract template: ${error}`);
  }
}
