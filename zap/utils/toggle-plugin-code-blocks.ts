import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getAllFiles } from "./get-all-files";

export const togglePluginCodeBlocks = (selectedPlugins: string[]) => {
  const srcDir = resolve(process.cwd(), "src");

  if (!existsSync(srcDir)) {
    console.warn("src/ directory not found, skipping code block toggling.");
    return;
  }
  const files = getAllFiles(srcDir);

  files.forEach((filePath) => {
    if (!filePath.match(/\.(ts|tsx|js|jsx|md|mdx)$/)) {
      return;
    }

    let content = readFileSync(filePath, "utf-8");
    let modified = false;

    const pluginBlocks = content.matchAll(
      /\/\/ ZAP_PLUGIN:(\w+):START([\s\S]*?)\/\/ ZAP_PLUGIN:\1:END/g,
    );

    for (const match of pluginBlocks) {
      const pluginName = match[1];
      const codeBlock = match[2];
      const isEnabled = selectedPlugins.includes(pluginName);

      let lines = codeBlock.split("\n");
      if (isEnabled) {
        lines = lines.map((line) =>
          line.trimStart().startsWith("// ")
            ? line.replace(/^\/\/\s*/, "")
            : line,
        );
      } else {
        lines = lines.map((line) =>
          line.trim() && !line.trimStart().startsWith("// ")
            ? `// ${line}`
            : line,
        );
      }

      const newBlock = `${lines.join("\n")}`;
      content = content.replace(
        match[0],
        `// ZAP_PLUGIN:${pluginName}:START\n${newBlock}\n// ZAP_PLUGIN:${pluginName}:END`,
      );
      modified = true;
    }

    if (modified) {
      writeFileSync(filePath, content);
    }
  });
};
