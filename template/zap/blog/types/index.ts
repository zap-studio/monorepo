import type z from "zod";
import type { postMetadataSchema } from "../schemas";

export type PostMetadata = z.infer<typeof postMetadataSchema>;
