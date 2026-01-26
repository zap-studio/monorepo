import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';



const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_APP_DIR: string = path.resolve(__dirname, '..');                              // "/apps/mcp"
const DOCS_DIR: string = path.resolve(MCP_APP_DIR, '../../apps/docs/src');              // "apps/docs/src"
const OUTPUT_FILE_PATH: string = path.resolve(MCP_APP_DIR, 'src/docs-bundle.json');     // "apps/mcp/src/docs-bundle.json"

// Here we define the directories where we will extract the ".md" files .
// In the future if there is new doc added to the "/apps/src" just add the DIR here 
// and add it to the DIRS list.
const DOCS_PACKAGES_DIR: string = path.resolve(DOCS_DIR, "packages")
const DOCS_LOCAL_TS: string = path.resolve(DOCS_DIR, "local-ts")
const DIRS: string[] = [DOCS_PACKAGES_DIR, DOCS_LOCAL_TS];

async function generateBundle(): Promise<void> {

    const config: Record<string, Record<string, any>> = {};

    for (const directory of DIRS) {
        const files = await glob(`${directory}/**/*.md`);
        for (const file of files) {
            const cleanPath = file.replace(".md", "");
            const parts = cleanPath.split(path.sep);

            const ressourceName = parts.at(-1);
            const pkgName = parts.at(-2);
            if (!pkgName || !ressourceName) continue;
            try {
                const content = await fs.readFile(file, 'utf-8');
                if (!config[pkgName]) config[pkgName] = {};
                config[pkgName][ressourceName] = {
                    static: content,
                    dynamic: `${pkgName}/${ressourceName}`
                };
            } catch (error) {
                console.error(`Error reading the following ${file}: ${error}`);
                process.exit(1);
            }

        }
    }

    await fs.writeFile(OUTPUT_FILE_PATH, JSON.stringify(config, null, 2));
    console.log(` JSON generated successfully with ${Object.keys(config).length} sections`)
}


await generateBundle()
