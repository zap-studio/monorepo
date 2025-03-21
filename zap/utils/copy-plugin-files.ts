import { existsSync, mkdirSync, cpSync } from "fs";
import { resolve } from "path";

export const copyPluginFiles = (selectedPlugins: string[]) => {
  console.log("Copying plugin files for selected plugins... Please wait.");

  selectedPlugins.forEach((pluginName) => {
    const pluginDir = resolve(process.cwd(), "zap/plugins", pluginName);

    if (!existsSync(pluginDir)) {
      console.warn(
        `Plugin directory zap/plugins/${pluginName} not found, skipping file copying.`,
      );
      return;
    }

    const pathsToCopy = [
      {
        source: resolve(pluginDir, "src"),
        dest: resolve(process.cwd(), "src"),
      },
      {
        source: resolve(pluginDir, "public"),
        dest: resolve(process.cwd(), "public"),
      },
    ];

    if (pluginName === "drizzle") {
      const drizzleConfigSource = resolve(pluginDir, "drizzle.config.ts");
      const drizzleConfigDest = resolve(process.cwd(), "drizzle.config.ts");

      if (existsSync(drizzleConfigSource)) {
        cpSync(drizzleConfigSource, drizzleConfigDest);
      } else {
        console.warn(
          "drizzle.config.ts not found in the drizzle plugin directory, skipping.",
        );
      }
    }

    pathsToCopy.forEach(({ source, dest }) => {
      if (existsSync(source)) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }

        cpSync(source, dest, { recursive: true });
      }
    });
  });

  console.log("Plugin files copied successfully.");
};
