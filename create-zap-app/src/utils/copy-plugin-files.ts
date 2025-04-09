import fs from "fs-extra";
import path from "path";
import { handleFileCopy } from "./handle-file-copy.js";

/**
 * Recursively copies plugin files from the source directory to the destination directory.
 *
 * @param {string} srcDir - The source directory containing the plugin files.
 * @param {string} destDir - The destination directory where files will be copied.
 * @param {any} spinner - A spinner instance used for CLI feedback (e.g., from Ora).
 *
 * @returns {Promise<void>} A promise that resolves once all files have been copied.
 *
 * @example
 * ```ts
 * await copyPluginFiles("./plugins/pluginA", "./core", spinner);
 * ```
 */
export const copyPluginFiles = async (
  srcDir: string,
  destDir: string,
  spinner: any
): Promise<void> => {
  const files = await fs.readdir(srcDir, { withFileTypes: true });

  // Step 1: Copy all files
  for (const file of files) {
    const srcPath = path.join(srcDir, file.name);
    const destPath = path.join(destDir, file.name);

    if (file.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyPluginFiles(srcPath, destPath, spinner);
    } else {
      await handleFileCopy(srcPath, destPath, file.name, spinner);
    }
  }
};
