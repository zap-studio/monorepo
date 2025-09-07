import path from "node:path";
import { CorePluginIds, OptionalPluginIds } from "@zap-ts/architecture/plugins";
import type {
  CorePluginId,
  OptionalPluginId,
  PluginId,
} from "@zap-ts/architecture/types";
import fs from "fs-extra";

export function dedupePluginEntries<
  T extends { plugin: PluginId; path: string },
>(arr: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const entry of arr) {
    const key = `${entry.plugin}:${entry.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  }
  return result;
}

export function classifyPlugin(
  plugin: PluginId
): "core" | "optional" | "unknown" {
  if (Object.values(CorePluginIds).includes(plugin as CorePluginId)) {
    return "core";
  }
  if (Object.values(OptionalPluginIds).includes(plugin as OptionalPluginId)) {
    return "optional";
  }
  return "unknown";
}

export function addTypeToEntry(entry: { plugin: PluginId; path: string }): {
  type: "core" | "optional" | "unknown";
  plugin: PluginId;
  path: string;
} {
  return {
    ...entry,
    type: classifyPlugin(entry.plugin),
  };
}

export function sortByTypeAndPlugin(
  arr: Array<{
    plugin: PluginId;
    path: string;
    type: "core" | "optional" | "unknown";
  }>
): {
  plugin: PluginId;
  path: string;
  type: "core" | "optional" | "unknown";
}[] {
  const typeOrder = { core: 0, optional: 1, unknown: 2 };
  return arr.sort((a, b) =>
    typeOrder[a.type] === typeOrder[b.type]
      ? a.plugin.localeCompare(b.plugin)
      : typeOrder[a.type] - typeOrder[b.type]
  );
}

export function compareCoreOptionalPlugin(
  a: {
    corePlugin: PluginId;
    optionalPlugin: PluginId;
    path: string;
  },
  b: {
    corePlugin: PluginId;
    optionalPlugin: PluginId;
    path: string;
  }
): number {
  if (a.corePlugin === b.corePlugin) {
    if (a.optionalPlugin === b.optionalPlugin) {
      return a.path.localeCompare(b.path);
    }
    return a.optionalPlugin.localeCompare(b.optionalPlugin);
  }
  return a.corePlugin.localeCompare(b.corePlugin);
}

export function sortByPluginAndPath(
  arr: Array<{ plugin: PluginId; path: string }>
): {
  plugin: PluginId;
  path: string;
}[] {
  return arr.sort((a, b) =>
    a.plugin === b.plugin
      ? a.path.localeCompare(b.path)
      : a.plugin.localeCompare(b.plugin)
  );
}

export async function getSrcDir(): Promise<string | null> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "zap.config.ts");
  const srcDir = path.join(cwd, "src");
  return (await fs.pathExists(configPath)) && (await fs.pathExists(srcDir))
    ? srcDir
    : null;
}

export async function getZapDir(): Promise<string | null> {
  const zapDir = path.join(process.cwd(), "zap");
  return (await fs.pathExists(zapDir)) ? zapDir : null;
}

export async function getAllFiles(
  dir: string,
  extList: string[] = [".ts", ".tsx", ".js", ".jsx", ".mdx"]
): Promise<string[]> {
  const results: string[] = [];
  const list = await fs.readdir(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      results.push(...(await getAllFiles(filePath, extList)));
    } else if (extList.some((ext) => filePath.endsWith(ext))) {
      results.push(filePath);
    }
  }

  return results;
}

export async function findZapImports(
  file: string
): Promise<Array<{ plugin: PluginId; path: string }>> {
  const content = await fs.readFile(file, "utf8");
  const regex = /(?:import|require)[^'"]+['"]@\/zap\/([^/'"]+)/g; // matches @/zap/<plugin-id>

  const matches: Array<{ plugin: PluginId; path: string }> = [];
  let match: RegExpExecArray | null = regex.exec(content);

  while (match !== null) {
    matches.push({ plugin: match[1] as PluginId, path: file });
    match = regex.exec(content);
  }

  return matches;
}
