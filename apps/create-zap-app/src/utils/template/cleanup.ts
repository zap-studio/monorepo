import path from 'node:path';
import { Effect } from 'effect';
import fs from 'fs-extra';
import { LOCKFILES } from '@/data/package-manager';

export function cleanupOutputDirectory(outputDir: string) {
  const program = Effect.gen(function* () {
    const ouputFiles = yield* Effect.tryPromise(() => fs.readdir(outputDir));

    for (const file of ouputFiles) {
      const filePath = yield* Effect.try(() => path.join(outputDir, file));
      if (file !== 'temp') {
        yield* Effect.tryPromise(() => fs.remove(filePath));
      }
    }
  });

  return program;
}

export function removeLockFiles(outputDir: string) {
  const program = Effect.gen(function* () {
    for (const lockFile of LOCKFILES) {
      const lockFilePath = yield* Effect.try(() =>
        path.join(outputDir, lockFile)
      );
      if (yield* Effect.try(() => fs.existsSync(lockFilePath))) {
        yield* Effect.tryPromise(() => fs.remove(lockFilePath));
      }
    }
  });

  return program;
}

export function cleanupPackageJson(outputDir: string) {
  const program = Effect.gen(function* () {
    const packageJsonPath = yield* Effect.try(() =>
      path.join(outputDir, 'package.json')
    );
    if (yield* Effect.try(() => fs.existsSync(packageJsonPath))) {
      const packageJson = yield* Effect.tryPromise(() =>
        fs.readJson(packageJsonPath)
      );

      if (packageJson.packageManager) {
        packageJson.packageManager = undefined;
        yield* Effect.try(() =>
          fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
        );
      }
    }
  });

  return program;
}
