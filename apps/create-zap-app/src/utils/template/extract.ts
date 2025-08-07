import { execa } from 'execa';
import fs from 'fs-extra';
import { ProcessExitError } from '@/lib/errors';

export async function extractTemplate(outputDir: string, tarballPath: string) {
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
