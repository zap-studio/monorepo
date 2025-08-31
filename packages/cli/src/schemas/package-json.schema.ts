import z from 'zod';

export const packageJsonSchema: z.ZodObject<
  {
    version: z.ZodString;
  },
  z.core.$strip
> = z.object({
  version: z.string(),
});
