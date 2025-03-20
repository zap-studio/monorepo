import { spawnSync } from "child_process";
import { existsSync, mkdirSync, cpSync, readdirSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

export const PluginNameSchema = z.union([
  z.literal("admin-dashboard"),
  z.literal("ai"),
  z.literal("blog"),
  z.literal("drizzle"),
  z.literal("emails"),
  z.literal("legal"),
  z.literal("polar"),
  z.literal("prisma"),
  z.literal("pwa"),
  z.literal("stripe"),
]);
export const PluginCategorySchema = z.literal("orm");
export const PluginMetadataSchema = z.object({
  name: PluginNameSchema,
  category: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});
export const PluginsMetadataSchema = z.array(PluginMetadataSchema);
export const PluginSchema = z.object({
  ...PluginMetadataSchema.shape,
  setup: z.function(),
});
export const PluginsSchemas = z.array(PluginSchema);

export type PluginName = z.infer<typeof PluginNameSchema>;
export type PluginMetadata = z.infer<typeof PluginMetadataSchema>;
export type PluginsMetadata = z.infer<typeof PluginsMetadataSchema>;
export type Plugin = z.infer<typeof PluginSchema>;
export type Plugins = z.infer<typeof PluginsSchemas>;

const plugins: Plugins = [];

export function registerPlugin(plugin: Plugin) {
  plugins.push(plugin);
}

export function setupPlugins() {
  const ormPlugins = plugins.filter((p) => p.category === "orm");
  if (ormPlugins.length === 0) {
    throw new Error(
      "At least one ORM plugin (Drizzle or Prisma) must be enabled.",
    );
  }

  if (ormPlugins.length > 1) {
    throw new Error(
      "Only one ORM plugin (Drizzle or Prisma) can be enabled at a time.",
    );
  }

  plugins.forEach((plugin) => {
    console.log(`Setting up plugin: ${plugin.name}`);

    if (plugin.dependencies) {
      const missingDeps = plugin.dependencies.filter((dep) => {
        try {
          require.resolve(dep);
          return false;
        } catch {
          return true;
        }
      });
      if (missingDeps.length > 0) {
        console.warn(
          `Warning: Plugin "${plugin.name}" is enabled but missing dependencies: ${missingDeps.join(", ")}.`,
        );

        // detect package manager and install missing dependencies
        const packageManager = existsSync("yarn.lock")
          ? "yarn"
          : existsSync("bun.lock")
            ? "bun"
            : existsSync("pnpm-lock.yaml")
              ? "pnpm"
              : "npm";
        console.log(
          `Installing missing dependencies with ${packageManager}...`,
        );

        const command = ["bun", "yarn", "pnpm"].includes(packageManager)
          ? "add"
          : "install";
        const args = [command, ...missingDeps];

        // install missing dependencies
        const result = spawnSync(packageManager, args, {
          stdio: "inherit",
        });

        if (result.status !== 0) {
          throw new Error(
            `Failed to install dependencies using ${packageManager}. Please try to install missing dependencies manually.`,
          );
        }
      }
    }

    // run the plugin's setup function
    plugin.setup();

    // ensure public/ and src/ directories exist
    const publicPath = resolve(process.cwd(), "public");
    const appPath = resolve(process.cwd(), "src");
    if (!existsSync(publicPath)) mkdirSync(publicPath, { recursive: true });
    if (!existsSync(appPath)) mkdirSync(appPath, { recursive: true });

    // copy plugin-specific files from the plugin's directory to the base directory following their internal structure (public/, src/, etc.)
    const pluginPath = resolve(__dirname, plugin.name);
    const pluginSubPaths = readdirSync(pluginPath).filter(
      (subPath) => subPath !== "index.ts",
    );

    // copy files from the plugin's directory to the base directory
    pluginSubPaths.forEach((subPath) => {
      const sourcePath = resolve(pluginPath, subPath);
      const targetPath = resolve(process.cwd(), subPath);
      cpSync(sourcePath, targetPath);
    });
  });
}
