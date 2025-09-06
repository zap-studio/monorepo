import path from "node:path";
import fs from "fs-extra";
import { CorePluginIds, OptionalPluginIds } from "@zap-ts/architecture/plugins";
import type {
  CorePluginId,
  OptionalPluginId,
  PluginId,
} from "@zap-ts/architecture/types";

export async function summarizePlugins(options: {
  output?: string;
}): Promise<void> {
  const srcDir = await getSrcDir();
  if (!srcDir) {
    process.stderr.write("No zap.config.ts found in current directory.\n");
    process.exit(1);
  }

  const step1 = await analyzeSrcPlugins(srcDir);
  const { corePlugins: step2, optionalPlugins: step3 } =
    await analyzeZapPlugins();
  const step4 = await findCorePluginOptionalImports(step2);

  const output = formatSummary(step1, step2, step3, step4);

  if (options.output) {
    await fs.writeFile(options.output, output, "utf8");
    process.stdout.write(`Summary written to ${options.output}\n`);
  } else {
    process.stdout.write(output);
  }
}

async function analyzeSrcPlugins(srcDir: string) {
  const srcFiles = await getAllFiles(srcDir);
  const zapImports = (await Promise.all(srcFiles.map(findZapImports))).flat();

  const imports = zapImports.map(addTypeToEntry);

  return sortByTypeAndPlugin(imports);
}

async function analyzeZapPlugins() {
  const zapDir = await getZapDir();
  if (!zapDir) {
    process.stdout.write("No zap/ directory found in current directory.\n");
    process.exit(1);
  }

  const zapFiles = await getAllFiles(zapDir);
  const zapEntries = (await Promise.all(zapFiles.map(findZapImports)))
    .flat()
    .map(addTypeToEntry);

  const corePlugins = sortByPluginAndPath(
    zapEntries.filter((x) => x.type === "core")
  );
  const optionalPlugins = sortByPluginAndPath(
    zapEntries.filter((x) => x.type === "optional")
  );

  return { corePlugins, optionalPlugins };
}

async function findCorePluginOptionalImports(
  corePlugins: Array<{ plugin: PluginId; path: string }>
) {
  const results: Array<{
    corePlugin: PluginId;
    optionalPlugin: PluginId;
    path: string;
  }> = [];

  for (const { plugin: corePlugin, path: coreFile } of corePlugins) {
    const pluginDir = path.join(process.cwd(), "zap", corePlugin);
    if (!coreFile.startsWith(pluginDir)) {
      continue;
    }

    const imports = await findZapImports(coreFile);
    for (const { plugin: importedPlugin } of imports) {
      if (classifyPlugin(importedPlugin) === "optional") {
        results.push({
          corePlugin,
          optionalPlugin: importedPlugin,
          path: coreFile.replace(`${process.cwd()}/`, ""),
        });
      }
    }
  }

  return results.sort((a, b) => {
    if (a.corePlugin === b.corePlugin) {
      if (a.optionalPlugin === b.optionalPlugin) {
        return a.path.localeCompare(b.path);
      }
      return a.optionalPlugin.localeCompare(b.optionalPlugin);
    }
    return a.corePlugin.localeCompare(b.corePlugin);
  });
}

function formatSummary(
  step1: Array<{ plugin: PluginId; path: string; type: string }>,
  step2: Array<{ plugin: PluginId; path: string }>,
  step3: Array<{ plugin: PluginId; path: string }>,
  step4: Array<{ corePlugin: PluginId; optionalPlugin: PluginId; path: string }>
): string {
  const cwd = process.cwd();

  const lines: string[] = [];

  lines.push("\nStep 1 - Determine core plugins:");
  for (const { plugin, path: _path, type } of step1) {
    lines.push(`- '${plugin}' (${type}): ${_path.replace(`${cwd}/`, "")}`);
  }

  lines.push("\nStep 2 - Core plugin imports:");
  for (const { plugin, path: _path } of step2) {
    lines.push(`- '${plugin}' (core): ${_path.replace(`${cwd}/`, "")}`);
  }

  lines.push("\nStep 3 - Optional plugin imports:");
  for (const { plugin, path: _path } of step3) {
    lines.push(`- '${plugin}' (optional): ${_path.replace(`${cwd}/`, "")}`);
  }

  lines.push("\nStep 4 - Warnings: Optional plugins imported by core plugins:");
  if (step4.length === 0) {
    lines.push("- None found.");
  } else {
    for (const { corePlugin, optionalPlugin, path: _path } of step4) {
      lines.push(
        `- Core plugin '${corePlugin}' imports optional plugin '${optionalPlugin}' in ${_path}`
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

async function getSrcDir(): Promise<string | null> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "zap.config.ts");
  const srcDir = path.join(cwd, "src");
  return (await fs.pathExists(configPath)) && (await fs.pathExists(srcDir))
    ? srcDir
    : null;
}

async function getZapDir(): Promise<string | null> {
  const zapDir = path.join(process.cwd(), "zap");
  return (await fs.pathExists(zapDir)) ? zapDir : null;
}

async function getAllFiles(
  dir: string,
  extList = [".ts", ".tsx", ".js", ".jsx", ".mdx"]
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

async function findZapImports(
  file: string
): Promise<Array<{ plugin: PluginId; path: string }>> {
  const content = await fs.readFile(file, "utf8");
  const regex = /(?:import|require)[^'"]+['"]@\/zap\/([^/'"]+)/g;

  const matches: Array<{ plugin: PluginId; path: string }> = [];
  let match: RegExpExecArray | null = regex.exec(content);

  while (match !== null) {
    matches.push({ plugin: match[1] as PluginId, path: file });
    match = regex.exec(content);
  }

  return matches;
}

function classifyPlugin(plugin: PluginId): "core" | "optional" | "unknown" {
  if (Object.values(CorePluginIds).includes(plugin as CorePluginId)) {
    return "core";
  }
  if (Object.values(OptionalPluginIds).includes(plugin as OptionalPluginId)) {
    return "optional";
  }
  return "unknown";
}

function addTypeToEntry(entry: { plugin: PluginId; path: string }) {
  return {
    ...entry,
    type: classifyPlugin(entry.plugin),
  };
}

function sortByTypeAndPlugin(
  arr: Array<{
    plugin: PluginId;
    path: string;
    type: "core" | "optional" | "unknown";
  }>
) {
  const typeOrder = { core: 0, optional: 1, unknown: 2 };
  return arr.sort((a, b) =>
    typeOrder[a.type] === typeOrder[b.type]
      ? a.plugin.localeCompare(b.plugin)
      : typeOrder[a.type] - typeOrder[b.type]
  );
}

function sortByPluginAndPath(arr: Array<{ plugin: PluginId; path: string }>) {
  return arr.sort((a, b) =>
    a.plugin === b.plugin
      ? a.path.localeCompare(b.path)
      : a.plugin.localeCompare(b.plugin)
  );
}
