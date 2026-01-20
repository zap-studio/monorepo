import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { allDocs } from "./docs-bundle.ts";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";



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
        description: "Contains the list of all available documentation file paths"
    },
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: "Available documentation paths:\n" + Object.keys(allDocs).join("\n"),
            mimeType: "text/plain"
        }]
    })
);

server.registerResource(
    "doc-content",
    new ResourceTemplate("docs://{+path}", { list: undefined }),
    {
        title: "Documentation Content",
        description: "Retrieves the markdown content. Use the exact path from the index."
    },
    async (uri, { path }) => {
        const pathString = String(path);
        const cleanPath = pathString.startsWith('/') ? pathString.slice(1) : pathString;
        const content = allDocs[cleanPath as keyof typeof allDocs];
        if (!content) {
            throw new Error(`Document not found: ${path}`);
        }
        return {
            contents: [{
                uri: uri.href,
                text: content,
                mimeType: "text/markdown"
            }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Zap MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});