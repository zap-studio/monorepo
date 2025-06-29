import path from 'node:path';
import fs from 'fs-extra';

export async function moveTempFilesToOutput(
  outputDir: string,
  tempDir: string
) {
  const tempFiles = await fs.readdir(tempDir);
  for (const file of tempFiles) {
    const srcPath = path.join(tempDir, file);
    const destPath = path.join(outputDir, file);
    fs.moveSync(srcPath, destPath, { overwrite: true });
  }
}
