import { Effect } from 'effect';
import { LOCKFILES } from '@/data/package-manager';
import {
  existsSyncEffect,
  joinPathEffect,
  readdirEffect,
  readJsonEffect,
  removeFileEffect,
  writeJsonEffect,
} from '..';

export function cleanupOutputDirectory(outputDir: string) {
  const program = Effect.gen(function* () {
    const ouputFiles = yield* readdirEffect(outputDir);

    for (const file of ouputFiles) {
      const filePath = yield* joinPathEffect(outputDir, file);
      if (file !== 'temp') {
        yield* removeFileEffect(filePath);
      }
    }
  });

  return program;
}

export function removeLockFiles(outputDir: string) {
  const program = Effect.gen(function* () {
    for (const lockFile of LOCKFILES) {
      const lockFilePath = yield* joinPathEffect(outputDir, lockFile);
      if (yield* existsSyncEffect(lockFilePath)) {
        yield* removeFileEffect(lockFilePath);
      }
    }
  });

  return program;
}

export function cleanupPackageJson(outputDir: string) {
  const program = Effect.gen(function* () {
    const packageJsonPath = yield* joinPathEffect(outputDir, 'package.json');
    if (yield* existsSyncEffect(packageJsonPath)) {
      const packageJson = yield* readJsonEffect(packageJsonPath);

      if (packageJson.packageManager) {
        packageJson.packageManager = undefined;
        yield* writeJsonEffect(packageJsonPath, packageJson, { spaces: 2 });
      }
    }
  });

  return program;
}
