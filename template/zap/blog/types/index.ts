import type z from "zod";
import type { PostMetadataSchema } from "../schemas";

export type PostMetadata = z.infer<typeof PostMetadataSchema>;
