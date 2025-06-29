import path from 'node:path';
import fs from 'fs-extra';
import type { Ora } from 'ora';
import { cleanupOutputDirectory } from '@/utils/setup-template/cleanup-output-directory.js';
import { cleanupPackageJson } from '@/utils/setup-template/cleanup-package-json.js';
import { downloadTemplate } from '@/utils/setup-template/download-template.js';
import { extractTemplate } from '@/utils/setup-template/extract-template.js';
import { moveCoreFiles } from '@/utils/setup-template/move-core-files.js';
import { moveTempFilesToOutput } from '@/utils/setup-template/move-temp-files-to-output.js';
import { removeLockFiles } from '@/utils/setup-template/remove-lock-files.js';

export async function setupTemplate(outputDir: string, spinner: Ora) {
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
