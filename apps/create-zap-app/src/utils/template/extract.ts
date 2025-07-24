import { Effect } from 'effect';
import { execaEffect, removeFileEffect } from '..';

export function extractTemplate(outputDir: string, tarballPath: string) {
  const program = Effect.gen(function* () {
    yield* execaEffect('tar', [
      '-xzf',
      tarballPath,
      '-C',
      outputDir,
      '--strip-components=1',
    ]);
    yield* removeFileEffect(tarballPath);
  });

  return program;
}
