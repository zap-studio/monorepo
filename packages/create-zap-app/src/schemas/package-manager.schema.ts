import { z } from "zod";

/**
 * Zod schema for validating package manager selection.
 * Supports npm, yarn, pnpm, and bun as valid package managers.
 */
export const PackageManagerSchema: z.ZodUnion<
  readonly [
    z.ZodLiteral<"npm">,
    z.ZodLiteral<"yarn">,
    z.ZodLiteral<"pnpm">,
    z.ZodLiteral<"bun">,
  ]
> = z.union([
  z.literal("npm"),
  z.literal("yarn"),
  z.literal("pnpm"),
  z.literal("bun"),
]);

/**
 * TypeScript type representing valid package manager options.
 * Inferred from the PackageManagerSchema.
 */
export type PackageManager = z.infer<typeof PackageManagerSchema>;
