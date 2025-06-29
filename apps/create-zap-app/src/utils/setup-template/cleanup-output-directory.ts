import path from 'node:path';
import fs from 'fs-extra';

export async function cleanupOutputDirectory(outputDir: string) {
  const outputFiles = await fs.readdir(outputDir);
  for (const file of outputFiles) {
    const filePath = path.join(outputDir, file);
    if (file !== 'temp') {
      fs.removeSync(filePath);
    }
  }
}
