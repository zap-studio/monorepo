import { z, ZodRecord } from "zod"
import fs from 'node:fs/promises';


const LeafSchema: z.ZodObject<{
    static: z.ZodString;
    dynamic: z.ZodString;
}> = z.object(
    {
        static: z.string().min(1),
        dynamic: z.string()
    }
).strict()

const ConfigSchema: ZodRecord<z.ZodString, ZodRecord<z.ZodString, typeof LeafSchema>> = z.record(z.string(), z.record(z.string(), LeafSchema));



export async function parseConfig(path: string): Promise<TConfigSchema> {
    const file = await fs.readFile(path, 'utf-8');
    const raw = JSON.parse(file);
    return ConfigSchema.parse(raw);
}

export type TConfigSchema = z.infer<typeof ConfigSchema>;



// Example:
// {
//     "fetch": {
//         "feature1": {
//             "static": "content of .md",
//                 "dynamic": "url/of/the/ressource"
//         },
//         "feature2": {
//             "static": "content of .md",
//                 "dynamic": "url/of/the/ressource"
//         }

//     } ,....
// }