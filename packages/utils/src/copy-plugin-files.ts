import fs from "fs-extra";
import path from "path";
import type { ORM } from "@zap-ts/schemas";
import { handleFileCopy } from "./handle-file-copy";

/**
 * Recursively copies plugin files from the source directory to the destination directory.
 *
 * - **Step 1**: Copies all files except the `drizzle` and `prisma` folders at the root level.
 * - **Step 2**: Copies files from the selected ORM folder (`drizzle` or `prisma`) into the root directory.
 *
 * @param {string} srcDir - The source directory containing the plugin files.
 * @param {string} destDir - The destination directory where files will be copied.
 * @param {any} spinner - A spinner instance used for CLI feedback (e.g., from Ora).
 * @param {ORM} orm - The selected ORM (`"drizzle-orm"` or `"prisma-orm"`) to determine which ORM-specific files to copy.
 *
 * @returns {Promise<void>} A promise that resolves once all files have been copied.
 *
 * @example
 * ```ts
 * await copyPluginFiles("./plugins/pluginA", "./core", spinner, "prisma-orm");
 * ```
 */
export const copyPluginFiles = async (
  srcDir: string,
  destDir: string,
  spinner: any,
  orm: ORM
): Promise<void> => {
  const files = await fs.readdir(srcDir, { withFileTypes: true });

  // Step 1: Copy all files except drizzle and prisma folders
  for (const file of files) {
    const srcPath = path.join(srcDir, file.name);
    const destPath = path.join(destDir, file.name);

    // Skip drizzle and prisma folders at the root level
    if (
      file.isDirectory() &&
      (file.name === "drizzle" || file.name === "prisma")
    ) {
      continue;
    }

    if (file.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyPluginFiles(srcPath, destPath, spinner, orm);
    } else {
      await handleFileCopy(srcPath, destPath, file.name, spinner);
    }
  }

  // Step 2: Copy files from the selected ORM folder (drizzle or prisma) to the root
  const ormFolder = orm === "drizzle-orm" ? "drizzle" : "prisma";
  const ormSrcDir = path.join(srcDir, ormFolder);

  if (fs.existsSync(ormSrcDir)) {
    const ormFiles = await fs.readdir(ormSrcDir, { withFileTypes: true });
    for (const file of ormFiles) {
      const ormSrcPath = path.join(ormSrcDir, file.name);
      const ormDestPath = path.join(destDir, file.name);

      if (file.isDirectory()) {
        await fs.ensureDir(ormDestPath);
        await copyPluginFiles(ormSrcPath, ormDestPath, spinner, orm);
      } else {
        await handleFileCopy(ormSrcPath, ormDestPath, file.name, spinner);
      }
    }
  }
};
