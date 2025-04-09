import { z } from "zod";

export const PluginNameSchema = z.union([
  z.literal("admin-dashboard"),
  z.literal("ai"),
  z.literal("blog"),
  z.literal("pwa"),
]);
export const PluginNamesSchema = z.array(PluginNameSchema);
export const PluginCategorySchema = z.literal("orm");
export const PluginMetadataSchema = z.object({
  name: PluginNameSchema,
  category: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  available: z.boolean(),
  env: z.array(z.string()).optional(),
});
export const PluginsMetadataSchema = z.array(PluginMetadataSchema);

export type PluginName = z.infer<typeof PluginNameSchema>;
export type PluginNames = z.infer<typeof PluginNamesSchema>;
export type PluginMetadata = z.infer<typeof PluginMetadataSchema>;
export type PluginsMetadata = z.infer<typeof PluginsMetadataSchema>;
