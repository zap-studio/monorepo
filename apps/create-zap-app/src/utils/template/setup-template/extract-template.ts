import { execa } from 'execa';
import fs from 'fs-extra';

export async function extractTemplate(outputDir: string, tarballPath: string) {
  await execa('tar', [
    '-xzf',
    tarballPath,
    '-C',
    outputDir,
    '--strip-components=1',
  ]);
  await fs.remove(tarballPath);
}
