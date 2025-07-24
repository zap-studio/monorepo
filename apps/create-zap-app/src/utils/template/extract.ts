import { Effect } from 'effect';
import { execa } from 'execa';
import fs from 'fs-extra';

export function extractTemplate(outputDir: string, tarballPath: string) {
  const program = Effect.gen(function* () {
    yield* Effect.tryPromise(() =>
      execa('tar', [
        '-xzf',
        tarballPath,
        '-C',
        outputDir,
        '--strip-components=1',
      ])
    );
    yield* Effect.tryPromise(() => fs.remove(tarballPath));
  });

  return program;
}
