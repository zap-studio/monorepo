import path from 'node:path';
import fs from 'fs-extra';

export async function downloadTemplate(outputDir: string) {
  const tarballUrl =
    'https://api.github.com/repos/alexandretrotel/zap.ts/tarball/main';
  const response = await fetch(tarballUrl);
  const buffer = await response.arrayBuffer();
  const tarballPath = path.join(outputDir, 'zap.ts.tar.gz');
  await fs.writeFile(tarballPath, Buffer.from(buffer));
  return tarballPath;
}
