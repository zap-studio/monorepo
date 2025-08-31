import path from 'node:path';
import fs from 'fs-extra';
import type { Ora } from 'ora';
import { FileSystemError } from '@/lib/errors.js';
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

export async function setupTemplate(
  outputDir: string,
  spinner: Ora
): Promise<void> {
  try {
    const tarballPath = await downloadTemplate(outputDir);

    spinner.text = 'Extracting Zap.ts template...';
    await extractTemplate(outputDir, tarballPath);

    await moveCoreFiles(outputDir);
    await cleanupOutputDirectory(outputDir);

    const tempDir = path.join(outputDir, 'temp');
    await moveTempFilesToOutput(outputDir, tempDir);
    await fs.remove(tempDir);

    await removeLockFiles(outputDir);
    await cleanupPackageJson(outputDir);
  } catch (error) {
    spinner.fail(`Failed to setup template: ${String(error)}`);
    throw new FileSystemError(`Template setup failed: ${error}`);
  }
}
