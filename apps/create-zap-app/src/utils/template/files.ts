import { Effect } from 'effect';
import {
  ensureDirEffect,
  joinPathEffect,
  moveSyncEffect,
  readdirEffect,
} from '..';

export function moveCoreFiles(outputDir: string) {
  const program = Effect.gen(function* () {
    const tempDir = yield* joinPathEffect(outputDir, 'temp');
    yield* ensureDirEffect(tempDir);

    const coreDir = yield* joinPathEffect(outputDir, 'core');
    const files = yield* readdirEffect(coreDir);

    for (const file of files) {
      const srcPath = yield* joinPathEffect(coreDir, file);
      const destPath = yield* joinPathEffect(tempDir, file);
      yield* moveSyncEffect(srcPath, destPath, { overwrite: true });
    }
  });

  return program;
}

export function moveTempFilesToOutput(outputDir: string, tempDir: string) {
  const program = Effect.gen(function* () {
    yield* ensureDirEffect(tempDir);

    const tempFiles = yield* readdirEffect(tempDir);
    for (const file of tempFiles) {
      const srcPath = yield* joinPathEffect(tempDir, file);
      const destPath = yield* joinPathEffect(outputDir, file);
      yield* moveSyncEffect(srcPath, destPath, { overwrite: true });
    }
  });

  return program;
}
