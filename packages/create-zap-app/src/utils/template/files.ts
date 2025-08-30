import path from 'node:path';
import fs from 'fs-extra';
import { FileSystemError } from '@/lib/errors.js';

export async function moveCoreFiles(outputDir: string): Promise<void> {
  try {
    const tempDir = path.join(outputDir, 'temp');
    await fs.ensureDir(tempDir);

    const coreDir = path.join(outputDir, 'core');
    const files = await fs.readdir(coreDir);

    await Promise.all(
      files.map((file) => {
        const srcPath = path.join(coreDir, file);
        const destPath = path.join(tempDir, file);
        return fs.move(srcPath, destPath, { overwrite: true });
      })
    );
  } catch (error) {
    throw new FileSystemError(`Failed to move core files: ${error}`);
  }
}

export async function moveTempFilesToOutput(
  outputDir: string,
  tempDir: string
): Promise<void> {
  try {
    await fs.ensureDir(tempDir);

    const tempFiles = await fs.readdir(tempDir);
    await Promise.all(
      tempFiles.map((file) => {
        const srcPath = path.join(tempDir, file);
        const destPath = path.join(outputDir, file);
        return fs.move(srcPath, destPath, { overwrite: true });
      })
    );
  } catch (error) {
    throw new FileSystemError(`Failed to move temp files: ${error}`);
  }
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
