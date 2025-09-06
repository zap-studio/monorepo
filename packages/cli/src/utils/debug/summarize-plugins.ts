import path from "node:path";
import fs from "fs-extra";
import { CorePluginIds, OptionalPluginIds } from "@zap-ts/architecture/plugins";
import type {
  CorePluginId,
  OptionalPluginId,
  PluginId,
} from "@zap-ts/architecture/types";

async function getSrcDir(): Promise<string | null> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "zap.config.ts");
  const configExists = await fs.pathExists(configPath);
  if (configExists) {
    const srcDir = path.join(cwd, "src");
    const srcExists = await fs.pathExists(srcDir);
    if (srcExists) {
      return srcDir;
    }
  }
  return null;
}

async function getAllFiles(
  dir: string,
  extList = [".ts", ".tsx", ".js", ".jsx"]
): Promise<string[]> {
  const results: string[] = [];
  const list = await fs.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const nested = await getAllFiles(filePath, extList);
      for (const nestedFile of nested) {
        results.push(nestedFile);
      }
    } else if (extList.some((ext) => filePath.endsWith(ext))) {
      results.push(filePath);
    }
  }
  return results;
}

async function findZapImports(
  file: string
): Promise<Array<{ plugin: PluginId; path: string }>> {
  const content = await fs.readFile(file, "utf8");
  const regex = /(?:import|require)\s*.*?['"]@\/zap\/(\w+)['"]/g;
  const matches: Array<{ plugin: PluginId; path: string }> = [];
  let match: RegExpExecArray | null = regex.exec(content);
  while (match !== null) {
    matches.push({ plugin: match[1] as PluginId, path: file });
    match = regex.exec(content);
  }
  return matches;
}

function classifyPlugin(plugin: PluginId): "core" | "optional" | "unknown" {
  const corePluginIds: CorePluginId[] = Object.values(CorePluginIds);
  const optionalPluginIds: OptionalPluginId[] =
    Object.values(OptionalPluginIds);
  if (corePluginIds.includes(plugin as CorePluginId)) {
    return "core";
  }
  if (optionalPluginIds.includes(plugin as OptionalPluginId)) {
    return "optional";
  }
  return "unknown";
}

export async function summarizePlugins(options: {
  output?: string;
}): Promise<void> {
  const srcDir = await getSrcDir();
  if (!srcDir) {
    process.stderr.write("No zap.config.ts found in current directory.\n");
    process.exit(1);
  }

  // Step 1: Check all @/zap/ imports in src/
  const srcFiles = await getAllFiles(srcDir);
  const zapImports = await Promise.all(srcFiles.map(findZapImports));
  const step1 = zapImports.flatMap((item) => {
    return item.map((entry) => {
      return {
        plugin: entry.plugin,
        path: entry.path,
        type: classifyPlugin(entry.plugin),
      };
    });
  });

  // Step 2: Check where core plugins are imported from
  const coreImports = step1.filter((x) => x.type === "core");
  const step2 = coreImports.map(({ plugin, path: _path }) => ({
    plugin,
    path: _path,
  }));

  // Step 3: Check where optional plugins are imported from
  const optionalImports = step1.filter((x) => x.type === "optional");
  const step3 = optionalImports.map(({ plugin, path: _path }) => ({
    plugin,
    path: _path,
  }));

  // Output
  let output = "";
  output += "\nStep 1 - Determine core plugins:\n";
  for (const { plugin, path: _path, type } of step1) {
    output += `- '${plugin}' (${type}): ${_path.replace(`${process.cwd()}/`, "")}\n`;
  }

  output += "\nStep 2 - Core plugin imports:\n";
  for (const { plugin, path: _path } of step2) {
    output += `- '${plugin}' (core): ${_path.replace(`${process.cwd()}/`, "")}\n`;
  }

  output += "\nStep 3 - Optional plugin imports:\n";
  for (const { plugin, path: _path } of step3) {
    output += `- '${plugin}' (optional): ${_path.replace(`${process.cwd()}/`, "")}\n`;
  }

  if (options.output) {
    await fs.writeFile(options.output, output, "utf8");
    process.stdout.write(`Summary written to ${options.output}\n`);
  } else {
    process.stdout.write(output);
  }
}
