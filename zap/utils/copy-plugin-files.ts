import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import { ORM } from "../schemas/plugins.schema";

export const copyPluginFiles = (selectedPlugins: string[], orm: ORM) => {
  console.log("Copying plugin files for selected plugins... Please wait.");

  selectedPlugins.forEach((pluginName) => {
    const pluginDir = resolve(process.cwd(), "zap/plugins", pluginName);

    if (!existsSync(pluginDir)) {
      console.warn(
        `Plugin directory zap/plugins/${pluginName} not found, skipping file copying.`,
      );
      return;
    }

    const pluginFiles = readdirSync(pluginDir).filter(
      (file) =>
        file !== "index.ts" && statSync(resolve(pluginDir, file)).isFile(),
    );

    pluginFiles.forEach((file) => {
      const source = resolve(pluginDir, file);
      const dest = resolve(process.cwd(), file);

      if (existsSync(source)) {
        cpSync(source, dest, { recursive: true });
      }
    });

    const conditionalFolders = ["drizzle", "prisma"];
    conditionalFolders.forEach((folder) => {
      if (folder === orm && existsSync(resolve(pluginDir, folder))) {
        const folderPath = resolve(pluginDir, folder);
        const filesToCopy = readdirSync(folderPath, { withFileTypes: true });

        filesToCopy.forEach((file) => {
          const source = resolve(folderPath, file.name);
          const dest = resolve(process.cwd(), file.name);

          if (file.isDirectory()) {
            if (!existsSync(dest)) {
              mkdirSync(dest, { recursive: true });
            }
            cpSync(source, dest, { recursive: true });
          } else if (file.isFile()) {
            cpSync(source, dest);
          }
        });
      }
    });

    const pluginSubfolders = readdirSync(pluginDir, {
      withFileTypes: true,
    }).filter(
      (entry) =>
        entry.isDirectory() && !conditionalFolders.includes(entry.name),
    );

    pluginSubfolders.forEach((folder) => {
      const source = resolve(pluginDir, folder.name);
      const dest = resolve(process.cwd(), folder.name);

      if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
      }

      cpSync(source, dest, { recursive: true });
    });
  });

  console.log("Plugin files copied successfully.");
};
