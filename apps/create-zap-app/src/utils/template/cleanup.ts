import path from 'node:path';
import fs from 'fs-extra';

/**
 * Cleans up the output directory by removing all files except the 'temp' directory.
 *
 * This function is used during template setup to remove extracted template files
 * that need to be reorganized. It preserves the 'temp' directory which contains
 * core files that will be moved back to the output directory with proper structure.
 *
 * @param outputDir - The directory to clean
 * @returns Promise that resolves when the cleanup is complete
 *
 * @example
 * ```typescript
 * import { cleanupOutputDirectory } from '@/utils/template';
 * await cleanupOutputDirectory('/path/to/project');
 * ```
 */
export async function cleanupOutputDirectory(outputDir: string): Promise<void> {
  const outputFiles = await fs.readdir(outputDir);
  await Promise.all(
    outputFiles
      .filter((file) => file !== 'temp')
      .map(async (file) => {
        const filePath = path.join(outputDir, file);
        await fs.remove(filePath);
      })
  );
}

/**
 * Removes package manager lock files from the output directory.
 *
 * This function removes common lock files (package-lock.json, yarn.lock, pnpm-lock.yaml)
 * to ensure the new project starts with a clean dependency state. This is important
 * because lock files from the template may not be compatible with the new project's
 * dependencies or package manager choice.
 *
 * @param outputDir - The directory to clean
 * @returns Promise that resolves when the cleanup is complete
 *
 * @example
 * ```typescript
 * import { removeLockFiles } from '@/utils/template';
 * removeLockFiles('/path/to/project');
 * ```
 */
export function removeLockFiles(outputDir: string): void {
  const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
  for (const lockFile of lockFiles) {
    const lockFilePath = path.join(outputDir, lockFile);
    if (fs.existsSync(lockFilePath)) {
      fs.removeSync(lockFilePath);
    }
  }
}

/**
 * Cleans up the package.json file by removing template-specific metadata.
 *
 * This function removes fields from package.json that are specific to the template
 * repository and should be customized for the new project. It preserves all
 * dependencies, scripts, and other functional configuration while removing
 * metadata like name, description, author, repository URLs, etc.
 *
 * @param outputDir - The directory containing the package.json file to clean
 * @returns Promise that resolves when the package.json has been cleaned
 *
 * @example
 * ```typescript
 * import { cleanupPackageJson } from '@/utils/template';
 * await cleanupPackageJson('/path/to/project');
 * ```
 * @throws {Error} If package.json cannot be read or written
 */
export async function cleanupPackageJson(outputDir: string): Promise<void> {
  const packageJsonPath = path.join(outputDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    const {
      name: _name,
      description: _description,
      author: _author,
      license: _license,
      repository: _repository,
      homepage: _homepage,
      bugs: _bugs,
      keywords: _keywords,
      ...cleanedPackageJson
    } = packageJson;
    await fs.writeJson(packageJsonPath, cleanedPackageJson, { spaces: 2 });
  }
}
