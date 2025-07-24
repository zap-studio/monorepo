import path from 'node:path';
import { Effect } from 'effect';
import fs from 'fs-extra';

export function downloadTemplate(outputDir: string) {
  const program = Effect.gen(function* () {
    const tarballUrl =
      'https://api.github.com/repos/alexandretrotel/zap.ts/tarball/main';

    yield* Effect.tryPromise(() => fs.ensureDir(outputDir));

    const response = yield* Effect.tryPromise(() => fetch(tarballUrl));

    if (!response.ok) {
      return yield* Effect.fail(
        new Error(
          `Failed to fetch template: ${response.status} ${response.statusText}`
        )
      );
    }

    const buffer = yield* Effect.tryPromise(() => response.arrayBuffer());
    const tarballPath = yield* Effect.try(() =>
      path.join(outputDir, 'zap.ts.tar.gz')
    );
    yield* Effect.tryPromise(() =>
      fs.writeFile(tarballPath, Buffer.from(buffer))
    );
    return tarballPath;
  });

  return program;
}
