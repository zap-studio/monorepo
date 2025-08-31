import type { Ora } from 'ora';
import { setupTemplate } from '@/utils/template/setup-template.js';

export async function setupProjectTemplate(
  outputDir: string,
  spinner: Ora
): Promise<void> {
  spinner.text = 'Downloading Zap.ts template from GitHub...';
  await setupTemplate(outputDir, spinner);
}
