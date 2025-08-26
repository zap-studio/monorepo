import path from 'node:path';
import fs from 'fs-extra';
import { LOCKFILES } from '@/data/package-manager';
import { FileSystemError } from '@/lib/errors';

export async function cleanupOutputDirectory(outputDir: string) {
  try {
    const outputFiles = await fs.readdir(outputDir);

    const removePromises = outputFiles
      .filter((file) => file !== 'temp')
      .map((file) => {
        const filePath = path.join(outputDir, file);
        return fs.remove(filePath);
      });

    await Promise.all(removePromises);
  } catch (error) {
    throw new FileSystemError(`Failed to cleanup output directory: ${error}`);
  }
}

export async function removeLockFiles(outputDir: string) {
  try {
    const removePromises = LOCKFILES.map((lockFile) =>
      path.join(outputDir, lockFile)
    )
      .filter((lockFilePath) => fs.existsSync(lockFilePath))
      .map((lockFilePath) => fs.remove(lockFilePath));

    await Promise.all(removePromises);
  } catch (error) {
    throw new FileSystemError(`Failed to remove lock files: ${error}`);
  }
}

export async function cleanupPackageJson(outputDir: string) {
  try {
    const packageJsonPath = path.join(outputDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);

      if (packageJson.packageManager) {
        packageJson.packageManager = undefined;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      }
    }
  } catch (error) {
    throw new FileSystemError(`Failed to cleanup package.json: ${error}`);
  }
}
