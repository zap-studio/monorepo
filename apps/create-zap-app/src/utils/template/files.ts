import path from 'node:path';
import { Effect } from 'effect';
import fs from 'fs-extra';

export function moveCoreFiles(outputDir: string) {
  const program = Effect.gen(function* () {
    const tempDir = yield* Effect.try(() => path.join(outputDir, 'temp'));
    yield* Effect.try(() => fs.ensureDir(tempDir));

    const coreDir = yield* Effect.try(() => path.join(outputDir, 'core'));
    const files = yield* Effect.tryPromise(() => fs.readdir(coreDir));

    for (const file of files) {
      const srcPath = yield* Effect.try(() => path.join(coreDir, file));
      const destPath = yield* Effect.try(() => path.join(tempDir, file));
      yield* Effect.tryPromise(() =>
        fs.move(srcPath, destPath, { overwrite: true })
      );
    }
  });

  return program;
}

export function moveTempFilesToOutput(outputDir: string, tempDir: string) {
  const program = Effect.gen(function* () {
    yield* Effect.try(() => fs.ensureDir(tempDir));

    const tempFiles = yield* Effect.tryPromise(() => fs.readdir(tempDir));
    for (const file of tempFiles) {
      const srcPath = yield* Effect.try(() => path.join(tempDir, file));
      const destPath = yield* Effect.try(() => path.join(outputDir, file));
      yield* Effect.tryPromise(() =>
        fs.move(srcPath, destPath, { overwrite: true })
      );
    }
  });

  return program;
}
