import fs from "fs-extra";
import inquirer from "inquirer";

/**
 * Handles copying a file from the source path to the destination path,
 * resolving conflicts if the file already exists.
 *
 * - If the file does not exist, it is copied directly.
 * - If the file exists, the user is prompted to choose an action:
 *   - **Overwrite**: Replaces the existing file.
 *   - **Skip**: Leaves the existing file unchanged.
 *   - **Merge (if applicable)**: Appends the source content to the destination file (for `.ts` or `.tsx` files).
 *
 * @param {string} srcPath - The source file path.
 * @param {string} destPath - The destination file path.
 * @param {string} fileName - The name of the file being copied.
 * @param {any} spinner - A CLI spinner instance for visual feedback (e.g., from Ora).
 *
 * @returns {Promise<void>} A promise that resolves once the file is copied, skipped, or merged.
 *
 * @example
 * ```ts
 * await handleFileCopy("./source/config.ts", "./destination/config.ts", "config.ts", spinner);
 * ```
 */
export const handleFileCopy = async (
  srcPath: string,
  destPath: string,
  fileName: string,
  spinner: any
): Promise<void> => {
  if (fs.existsSync(destPath)) {
    spinner.warn(`Conflict detected at ${destPath}`);
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: `File ${fileName} already exists. What would you like to do?`,
        choices: ["overwrite", "skip", "merge (if applicable)"],
      },
    ]);

    if (action === "skip") return;
    if (action === "merge (if applicable)") {
      if (srcPath.endsWith(".ts") || srcPath.endsWith(".tsx")) {
        const srcContent = await fs.readFile(srcPath, "utf-8");
        const destContent = await fs.readFile(destPath, "utf-8");

        await fs.writeFile(destPath, `${destContent}\n\n${srcContent}`);
        spinner.info(`Merged ${fileName}`);

        return;
      } else {
        spinner.info(`Cannot merge ${fileName}, overwriting instead`);
      }
    }
  }

  await fs.copy(srcPath, destPath, { overwrite: true });
};
