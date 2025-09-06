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
): Promise<Array<{ plugin: string; path: string }>> {
  const content = await fs.readFile(file, "utf8");
  const regex = /(?:import|require)\s*.*?['"]@\/zap\/(\w+)['"]/g;
  const matches: Array<{ plugin: string; path: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    matches.push({ plugin: match[1], path: file });
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

export async function summarizePlugins(): Promise<void> {
  const srcDir = await getSrcDir();
  if (!srcDir) {
    process.stderr.write("No zap.config.ts found in current directory.\n");
    process.exit(1);
  }

  // Step 1: Check all @/zap/ imports in src/
  const srcFiles = await getAllFiles(srcDir);
  const zapImports = await Promise.all(srcFiles.map(findZapImports));
  const step1 = zapImports.flatMap(({ plugin, path }) => ({
    plugin,
    path,
    type: classifyPlugin(plugin),
  }));

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
  process.stdout.write("\nStep 1 - Determine core plugins:");
  for (const { plugin, path: _path, type } of step1) {
    process.stdout.write(
      `- '${plugin}' (${type}) / ${_path.replace(`${process.cwd()}/`, "")}`
    );
  }

  process.stdout.write("\nStep 2 - Core plugin imports:");
  for (const { plugin, path: _path } of step2) {
    process.stdout.write(
      `core - '${plugin}' / ${_path.replace(`${process.cwd()}/`, "")}`
    );
  }

  process.stdout.write("\nStep 3 - Optional plugin imports:");
  for (const { plugin, path: _path } of step3) {
    process.stdout.write(
      `optional - '${plugin}' / ${_path.replace(`${process.cwd()}/`, "")}`
    );
  }
}
