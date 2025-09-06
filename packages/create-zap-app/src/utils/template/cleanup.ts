import path from "node:path";
import { IdeFiles } from "@zap-ts/architecture/files/ide";
import type { IDE } from "@zap-ts/architecture/types";
import fs from "fs-extra";
import { LOCKFILES } from "@/data/package-manager.js";
import { FileSystemError } from "@/lib/errors.js";
import { getErrorMessage } from "../misc/error";

export async function cleanupOutputDirectory(outputDir: string): Promise<void> {
  try {
    const outputFiles = await fs.readdir(outputDir);

    const removePromises = outputFiles
      .filter((file) => file !== "temp")
      .map((file) => {
        const filePath = path.join(outputDir, file);
        return fs.remove(filePath);
      });

    await Promise.all(removePromises);
  } catch (error) {
    throw new FileSystemError(
      `Failed to cleanup output directory: ${getErrorMessage(error)}`
    );
  }
}

export async function removeLockFiles(outputDir: string): Promise<void> {
  try {
    const removePromises = LOCKFILES.map((lockFile) =>
      path.join(outputDir, lockFile)
    )
      .filter((lockFilePath) => fs.existsSync(lockFilePath))
      .map((lockFilePath) => fs.remove(lockFilePath));

    await Promise.all(removePromises);
  } catch (error) {
    throw new FileSystemError(
      `Failed to remove lock files: ${getErrorMessage(error)}`
    );
  }
}

export async function removeIDEConfigFiles(
  outputDir: string,
  ide: IDE | "all" | null
): Promise<void> {
  try {
    if (ide === "all") {
      return; // keep all IDE config files
    }

    for (const entry of IdeFiles.entries) {
      if (entry.ide && entry.ide !== ide) {
        const filePath = path.join(outputDir, entry.path);
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      }
    }
  } catch (error) {
    throw new FileSystemError(
      `Failed to remove IDE config files: ${getErrorMessage(error)}`
    );
  }
}

export async function cleanupPackageJson(outputDir: string): Promise<void> {
  try {
    const packageJsonPath = path.join(outputDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);

      if (packageJson.packageManager) {
        packageJson.packageManager = undefined;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      }
    }
  } catch (error) {
    throw new FileSystemError(
      `Failed to cleanup package.json: ${getErrorMessage(error)}`
    );
  }
}
