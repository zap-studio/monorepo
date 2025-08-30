import path from 'node:path';
import fs from 'fs-extra';
import { GITHUB_DOWNLOAD_URL } from '@/data/website.js';
import { FileSystemError } from '@/lib/errors.js';

export async function downloadTemplate(outputDir: string): Promise<string> {
  try {
    const tarballUrl = GITHUB_DOWNLOAD_URL;

    await fs.ensureDir(outputDir);
    const response = await fetch(tarballUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch template: ${response.status} ${response.statusText}`
      );
    }

    const buffer = await response.arrayBuffer();
    const tarballPath = path.join(outputDir, 'zap.ts.tar.gz');
    await fs.writeFile(tarballPath, Buffer.from(buffer));
    return tarballPath;
  } catch (error) {
    throw new FileSystemError(`Failed to download template: ${error}`);
  }
}
