import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mcpAppDir = path.resolve(__dirname, '..');
const docsDir = path.resolve(mcpAppDir, '../../apps/docs/src');
const outputFile = path.resolve(mcpAppDir, 'src/docs-bundle.ts');


const files = globSync(`${docsDir}/**/*.md`, {
    ignore: [`${docsDir}/**/README.md`, `${docsDir}/**/node_modules/**`]
});

const docs = {};
for (const file of files) {
    const relativePath = path.relative(docsDir, file);
    docs[relativePath] = fs.readFileSync(file, 'utf-8');
    console.log(`   + ${relativePath}`);
}

const content = `// This file is auto-generated , please don't edit it .
export const allDocs = ${JSON.stringify(docs, null, 2)} as const;
export type DocPath = keyof typeof allDocs;`;


fs.writeFileSync(outputFile, content);
console.log(`\nBundle generated: ${outputFile}`);