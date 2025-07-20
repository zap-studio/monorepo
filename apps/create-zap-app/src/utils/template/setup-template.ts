import path from 'node:path';
import fs from 'fs-extra';
import type { Ora } from 'ora';
import {
  cleanupOutputDirectory,
  cleanupPackageJson,
  removeLockFiles,
} from '@/utils/template/cleanup.js';
import { downloadTemplate } from '@/utils/template/download.js';
import { extractTemplate } from '@/utils/template/extract.js';
import {
  moveCoreFiles,
  moveTempFilesToOutput,
} from '@/utils/template/files.js';

/**
 * Sets up a new Zap.ts project by downloading, extracting, and configuring the template.
 *
 * This function orchestrates the complete template setup process:
 * 1. Downloads the latest Zap.ts template tarball
 * 2. Extracts the template to the output directory
 * 3. Moves core files to a temporary location
 * 4. Cleans up the output directory structure
 * 5. Moves files from temp back to output with proper organization
 * 6. Removes temporary files and lock files
 * 7. Cleans up package.json for the new project
 *
 * @param outputDir - The directory where the new Zap.ts project will be created
 * @param spinner - An Ora spinner instance for displaying progress updates
 *
 * @example
 * ```typescript
 * import ora from 'ora';
 *
 * const spinner = ora('Setting up template...').start();
 * await setupTemplate('/path/to/new-project', spinner);
 * spinner.succeed('Template setup complete!');
 * ```
 */
export async function setupTemplate(
  outputDir: string,
  spinner: Ora
): Promise<void> {
  const tarballPath = await downloadTemplate(outputDir);

  spinner.text = 'Extracting Zap.ts template...';
  await extractTemplate(outputDir, tarballPath);

  await moveCoreFiles(outputDir);

  await cleanupOutputDirectory(outputDir);

  const tempDir = path.join(outputDir, 'temp');
  await moveTempFilesToOutput(outputDir, tempDir);

  await fs.remove(tempDir);

  removeLockFiles(outputDir);

  await cleanupPackageJson(outputDir);
}
