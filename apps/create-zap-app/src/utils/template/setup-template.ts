import path from 'node:path';
import fs from 'fs-extra';
import type { Ora } from 'ora';
import { cleanupOutputDirectory } from '@/utils/template/setup-template/cleanup-output-directory.js';
import { cleanupPackageJson } from '@/utils/template/setup-template/cleanup-package-json.js';
import { downloadTemplate } from '@/utils/template/setup-template/download-template.js';
import { extractTemplate } from '@/utils/template/setup-template/extract-template.js';
import { moveCoreFiles } from '@/utils/template/setup-template/move-core-files.js';
import { moveTempFilesToOutput } from '@/utils/template/setup-template/move-temp-files-to-output.js';
import { removeLockFiles } from '@/utils/template/setup-template/remove-lock-files.js';

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
  // Download template
  const tarballPath = await downloadTemplate(outputDir);

  // Extract template
  spinner.text = 'Extracting Zap.ts template...';
  await extractTemplate(outputDir, tarballPath);

  // Move core files to temp directory
  await moveCoreFiles(outputDir);

  // Clean up output directory
  await cleanupOutputDirectory(outputDir);

  // Move temp files to output directory
  const tempDir = path.join(outputDir, 'temp');
  await moveTempFilesToOutput(outputDir, tempDir);

  // Remove temp directory
  await fs.remove(tempDir);

  // Clean up lock files
  removeLockFiles(outputDir);

  // Clean up package.json
  await cleanupPackageJson(outputDir);
}
