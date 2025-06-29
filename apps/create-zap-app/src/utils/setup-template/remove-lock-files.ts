import path from 'node:path';
import fs from 'fs-extra';

export function removeLockFiles(outputDir: string) {
  const lockFiles = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    'bun.lock',
  ];
  for (const lockFile of lockFiles) {
    const lockFilePath = path.join(outputDir, lockFile);
    if (fs.existsSync(lockFilePath)) {
      fs.removeSync(lockFilePath);
    }
  }
}
