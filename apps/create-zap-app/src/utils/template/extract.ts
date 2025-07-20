import { execa } from 'execa';
import fs from 'fs-extra';

/**
 * Extracts a downloaded Zap.ts template tarball to the specified output directory.
 *
 * This function uses the system's `tar` command to extract the template tarball.
 * It strips the top-level directory component to avoid creating unnecessary nesting,
 * and automatically removes the tarball file after extraction to clean up disk space.
 *
 * @param outputDir - The directory where the template will be extracted
 * @param tarballPath - The path to the downloaded tarball file
 * @returns Promise that resolves when extraction is complete
 *
 * @example
 * ```typescript
 * import { extractTemplate } from '@/utils/template';
 * await extractTemplate('/path/to/project', '/path/to/project/zap.ts.tar.gz');
 * console.log('Template extracted');
 * ```
 *
 * @throws {Error} If the tar command fails or the tarball is corrupted
 */
export async function extractTemplate(
  outputDir: string,
  tarballPath: string
): Promise<void> {
  await execa('tar', [
    '-xzf',
    tarballPath,
    '-C',
    outputDir,
    '--strip-components=1',
  ]);
  await fs.remove(tarballPath);
}
