import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parseConfig } from "./utils.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";



const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, 'docs-bundle.json');
const allDocs = await parseConfig(CONFIG_PATH);

// Initialisation of the Server
const server = new McpServer({
    name: "zap-ts-mcp-server",
    version: "0.1.0",

}
)


server.registerResource(
    "docs-index",
    "docs://_all",
    {
        title: "Documentation Index",
        description: "List of all available documentation paths in package/resource format"
    },
    async (uri) => {
        const paths: string[] = [];
        for (const [pkg, resources] of Object.entries(allDocs)) {
            for (const res of Object.keys(resources)) {
                paths.push(`${pkg}/${res}`);
            }
        }
        return {
            contents: [{
                uri: uri.href,
                text: "Available documentation paths:\n" + paths.join("\n"),
                mimeType: "text/plain"
            }]
        };
    }
);


server.registerResource(
    "doc-content",
    new ResourceTemplate("docs://{pkg}/{resource}", { list: undefined }),
    {
        title: "Documentation Content",
        description: "Retrieves markdown content for a specific package and resource."
    },
    async (uri, { pkg, resource }) => {
        const pkgName = String(pkg);
        const resName = String(resource);

        const leaf = allDocs[pkgName]?.[resName];

        if (!leaf) {
            throw new Error(`Document not found: ${pkgName}/${resName}`);
        }

        return {
            contents: [{
                uri: uri.href,
                text: leaf.static,
                mimeType: "text/markdown"
            }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Zap Studio MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});