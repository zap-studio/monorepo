import z from "zod";

export const PostMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  author: z.string().optional(),
  image: z.string().optional(),
});
