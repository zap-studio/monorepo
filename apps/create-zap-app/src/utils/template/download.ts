import { Effect } from 'effect';
import {
  fetchEffect,
  joinPathEffect,
  toArrayBufferEffect,
  writeFileFromBuffer,
} from '..';

export function downloadTemplate(outputDir: string) {
  const program = Effect.gen(function* () {
    const tarballUrl =
      'https://api.github.com/repos/alexandretrotel/zap.ts/tarball/main';
    const response = yield* fetchEffect(tarballUrl);
    const buffer = yield* toArrayBufferEffect(response);
    const tarballPath = yield* joinPathEffect(outputDir, 'zap.ts.tar.gz');
    yield* writeFileFromBuffer(tarballPath, Buffer.from(buffer));
    return tarballPath;
  });

  return program;
}
