import path from 'node:path';
import type { IDE } from '@zap-ts/architecture/types';
import fs from 'fs-extra';
import type { Ora } from 'ora';
import {
  cleanupOutputDirectory,
  cleanupPackageJson,
  removeIDEConfigFiles,
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
  ide: IDE | 'all' | null,
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
    await removeIDEConfigFiles(outputDir, ide);
    await cleanupPackageJson(outputDir);
  } catch (error) {
    spinner.fail(`Failed to setup template: ${String(error)}`);
  }
}
