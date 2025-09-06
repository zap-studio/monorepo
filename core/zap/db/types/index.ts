import z from "zod";

export const UpsertModeSchema = z.enum([
  "create-only",
  "update-only",
  "upsert",
]);

export type UpsertMode = z.infer<typeof UpsertModeSchema>;
