import z from "zod";

export const postMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  author: z.string().optional(),
  image: z.string().optional(),
});

export type PostMetadata = z.infer<typeof postMetadataSchema>;
