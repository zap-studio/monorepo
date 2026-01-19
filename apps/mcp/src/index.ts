import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";



// Initialisation of the Server
const server = new McpServer({
    name: "zap-ts-mcp-server",
    version: "0.1.0",

}
)

// Dynamic template that will be used by the client
const docTemplate = new ResourceTemplate("docs://{package}/{section}", {
    list: undefined // On laisse vide car c'est dynamique
});

// Metadata for the ressource 
const resourceMetadata = {
    name: "Zap Studio Knowledge Base",
    description: "Dynamic access to the project documentation. Replace {package} with the module name (e.g., validation, permit, fetch) and {section} with the specific documentation topic or file name."
}


// Current URL of the file
const currentUrl = import.meta.url;

// Convert the URL to a system path
const currentPath = fileURLToPath(currentUrl);

// Only keep the directory 
const __dirname = path.dirname(currentPath);


/**
 * Register the ressource "zap-docs" in the server
 *
 * This allows the Client to get documentation information 
 * about a specific {package} and {section} without giving the
 * whole documentation to the LLM .
 */
server.registerResource(
    "zap-docs",
    docTemplate,
    resourceMetadata,
    async (uri, { package: pkg, section }) => {

        const filePath = path.resolve(
            __dirname,
            "../../docs/src/packages",
            pkg as string,
            `${section}.md`
        );
        try {
            const content = await readFile(filePath, "utf-8");
            return {
                contents: [{
                    uri: uri.href,
                    text: content,
                    mimeType: "text/markdown",
                }],
            };
        } catch (error) {
            throw new Error(`Document ${pkg}/${section}.md not found.`);
        }
    }

);

const transport = new StdioServerTransport();
await server.connect(transport);