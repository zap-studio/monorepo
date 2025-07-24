import { Effect } from 'effect';
import type { Ora } from 'ora';
import { setupTemplate } from '@/utils/template/setup-template';

export function setupProjectTemplate(outputDir: string, spinner: Ora) {
  const program = Effect.gen(function* () {
    spinner.text = 'Downloading Zap.ts template from GitHub...';
    yield* setupTemplate(outputDir, spinner);
  });

  return program;
}
