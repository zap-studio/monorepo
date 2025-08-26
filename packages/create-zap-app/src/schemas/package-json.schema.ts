import z from 'zod';

export const packageJsonSchema = z.object({
  version: z.string(),
});
