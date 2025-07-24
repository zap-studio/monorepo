import path from 'node:path';
import { Effect, pipe } from 'effect';
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

export function setupTemplate(outputDir: string, spinner: Ora) {
  const program = Effect.gen(function* () {
    const tarballPath = yield* pipe(
      downloadTemplate(outputDir),
      Effect.catchAll((error) => {
        spinner.fail(`Failed to download template: ${String(error)}`);
        return Effect.fail(new Error('Downloading template failed'));
      })
    );

    spinner.text = 'Extracting Zap.ts template...';
    yield* pipe(
      extractTemplate(outputDir, tarballPath),
      Effect.catchAll((error) => {
        spinner.fail(`Failed to extract template: ${String(error)}`);
        return Effect.fail(new Error('Extracting template failed'));
      })
    );

    yield* pipe(
      moveCoreFiles(outputDir),
      Effect.catchAll((error) => {
        spinner.fail(`Failed to move core files: ${String(error)}`);
        return Effect.fail(new Error('Moving core files failed'));
      })
    );

    yield* pipe(
      cleanupOutputDirectory(outputDir),
      Effect.catchAll((error) => {
        spinner.fail(`Failed to clean up output directory: ${String(error)}`);
        return Effect.fail(new Error('Cleaning up output directory failed'));
      })
    );

    const tempDir = yield* Effect.try(() => path.join(outputDir, 'temp'));
    yield* pipe(
      moveTempFilesToOutput(outputDir, tempDir),
      Effect.catchAll((error) => {
        spinner.fail(`Failed to move temporary files: ${String(error)}`);
        return Effect.fail(new Error('Moving temporary files failed'));
      })
    );

    yield* Effect.tryPromise(() => fs.remove(tempDir));

    yield* pipe(
      removeLockFiles(outputDir),
      Effect.catchAll((error) => {
        spinner.fail(`Failed to remove lock files: ${String(error)}`);
        return Effect.fail(new Error('Removing lock files failed'));
      })
    );

    yield* pipe(
      cleanupPackageJson(outputDir),
      Effect.catchAll((error) => {
        spinner.fail(`Failed to clean up package.json: ${String(error)}`);
        return Effect.fail(new Error('Cleaning up package.json failed'));
      })
    );
  });

  return program;
}
