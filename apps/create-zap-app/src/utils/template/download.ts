import path from 'node:path';
import fs from 'fs-extra';

/**
 * Downloads the latest Zap.ts template from GitHub as a tarball.
 *
 * This function fetches the main branch of the Zap.ts repository from GitHub's
 * tarball API and saves it to the specified output directory. The tarball
 * contains the complete template structure that will be extracted and configured.
 *
 * @param outputDir - The directory where the tarball will be saved
 * @returns Promise that resolves to the path of the downloaded tarball file
 *
 * @example
 * ```typescript
 * import { downloadTemplate } from '@/utils/template';
 * const tarballPath = await downloadTemplate('/path/to/project');
 * console.log(`Template downloaded: ${tarballPath}`);
 * ```
 *
 * @throws {Error} If the template download fails
 */
export async function downloadTemplate(outputDir: string): Promise<string> {
  const tarballUrl =
    'https://api.github.com/repos/alexandretrotel/zap.ts/tarball/main';
  const response = await fetch(tarballUrl);
  const buffer = await response.arrayBuffer();
  const tarballPath = path.join(outputDir, 'zap.ts.tar.gz');
  await fs.writeFile(tarballPath, Buffer.from(buffer));
  return tarballPath;
}
