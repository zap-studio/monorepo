import path from 'node:path';
import fs from 'fs-extra';

export async function moveCoreFiles(outputDir: string) {
  const tempDir = path.join(outputDir, 'temp');
  await fs.ensureDir(tempDir);

  const coreDir = path.join(outputDir, 'core');
  const files = await fs.readdir(coreDir);
  for (const file of files) {
    const srcPath = path.join(coreDir, file);
    const destPath = path.join(tempDir, file);
    fs.moveSync(srcPath, destPath, { overwrite: true });
  }
}
