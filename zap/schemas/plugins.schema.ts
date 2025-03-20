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
  available: z.boolean(),
  env: z.array(z.string()).optional(),
});
export const PluginsMetadataSchema = z.array(PluginMetadataSchema);

export type PluginName = z.infer<typeof PluginNameSchema>;
export type PluginMetadata = z.infer<typeof PluginMetadataSchema>;
export type PluginsMetadata = z.infer<typeof PluginsMetadataSchema>;
