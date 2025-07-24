import { Effect } from 'effect';
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
import { joinPathEffect, removeFileEffect } from '..';

export function setupTemplate(outputDir: string, spinner: Ora) {
  const program = Effect.gen(function* () {
    const tarballPath = yield* downloadTemplate(outputDir);

    spinner.text = 'Extracting Zap.ts template...';
    yield* extractTemplate(outputDir, tarballPath);

    yield* moveCoreFiles(outputDir);
    yield* cleanupOutputDirectory(outputDir);

    const tempDir = yield* joinPathEffect(outputDir, 'temp');
    yield* moveTempFilesToOutput(outputDir, tempDir);

    yield* removeFileEffect(tempDir);
    removeLockFiles(outputDir);
    yield* cleanupPackageJson(outputDir);
  });

  return program;
}
