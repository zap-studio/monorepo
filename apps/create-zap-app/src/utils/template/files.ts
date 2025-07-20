import path from 'node:path';
import fs from 'fs-extra';

/**
 * Moves core project files to a temporary directory for safekeeping.
 *
 * During template setup, this function preserves important project files
 * (package.json, lock files, README, .gitignore, .env.example) by moving
 * them to a temporary directory. This prevents them from being lost when
 * the output directory is cleaned up and reorganized.
 *
 * @param outputDir - The directory containing the core files to move
 * @returns Promise that resolves when all core files have been moved
 *
 * @example
 * ```typescript
 * import { moveCoreFiles } from '@/utils/template';
 * await moveCoreFiles('/path/to/project');
 * ```
 *
 * @throws {Error} If the temp directory cannot be created or files cannot be moved
 */
export async function moveCoreFiles(outputDir: string): Promise<void> {
  const tempDir = path.join(outputDir, 'temp');
  await fs.ensureDir(tempDir);

  const coreDir = path.join(outputDir, 'core');
  const files = await fs.readdir(coreDir);
  for (const file of files) {
    const srcPath = path.join(coreDir, file);
    const destPath = path.join(tempDir, file);
    fs.moveSync(srcPath, destPath, { overwrite: true });
  }
}

/**
 * Moves files from the temporary directory back to the output directory.
 *
 * After the output directory has been cleaned and reorganized, this function
 * moves the preserved core files from the temporary directory back to their
 * final location in the output directory. This is the final step in the
 * template reorganization process.
 *
 * @param outputDir - The destination directory where files will be moved
 * @param tempDir - The temporary directory containing the files to move
 * @returns Promise that resolves when all files have been moved
 *
 * @example
 * ```typescript
 * import { moveTempFilesToOutput } from '@/utils/template';
 * const tempDir = path.join(projectPath, 'temp');
 * await moveTempFilesToOutput(projectPath, tempDir);
 * ```
 *
 * @throws {Error} If files cannot be moved or the temp directory doesn't exist
 */
export async function moveTempFilesToOutput(
  outputDir: string,
  tempDir: string
): Promise<void> {
  const tempFiles = await fs.readdir(tempDir);
  for (const file of tempFiles) {
    const srcPath = path.join(tempDir, file);
    const destPath = path.join(outputDir, file);
    fs.moveSync(srcPath, destPath, { overwrite: true });
  }
}
