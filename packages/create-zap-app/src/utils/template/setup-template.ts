import type { IDE } from '@zap-ts/architecture/types';
import type { Ora } from 'ora';
import {
  cleanupPackageJson,
  removeIDEConfigFiles,
  removeLockFiles,
} from '@/utils/template/cleanup.js';
import { downloadTemplate } from '@/utils/template/download.js';
import { extractTemplate } from '@/utils/template/extract.js';
import { finalizeTemplateFiles } from '@/utils/template/files.js';

export async function setupTemplate(
  outputDir: string,
  ide: IDE | 'all' | null,
  spinner: Ora
): Promise<void> {
  try {
    const tarballPath = await downloadTemplate(outputDir);

    spinner.text = 'Extracting Zap.ts template...';
    await extractTemplate(outputDir, tarballPath);
    await finalizeTemplateFiles(outputDir);
    await removeLockFiles(outputDir);
    await removeIDEConfigFiles(outputDir, ide);
    await cleanupPackageJson(outputDir);
  } catch (error) {
    spinner.fail(`Failed to setup template: ${String(error)}`);
  }
}
