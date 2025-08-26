import type { Ora } from 'ora';
import { setupTemplate } from '@/utils/template/setup-template';

export async function setupProjectTemplate(outputDir: string, spinner: Ora) {
  spinner.text = 'Downloading Zap.ts template from GitHub...';
  await setupTemplate(outputDir, spinner);
}
