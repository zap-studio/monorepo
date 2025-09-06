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
  const { step2, step3 } = await analyzeZapPlugins();
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
  const zapImports = (
    await Promise.all(srcFiles.map((file) => findZapImports(file)))
  ).flat();

  return zapImports.map((entry) => ({
    plugin: entry.plugin,
    path: entry.path,
    type: classifyPlugin(entry.plugin),
  }));
}

async function analyzeZapPlugins() {
  const zapDir = await getZapDir();
  if (!zapDir) {
    process.stdout.write("No zap/ directory found in current directory.\n");
    process.exit(1);
  }

  const zapFiles = await getAllFiles(zapDir);
  const zapImportsZap = await Promise.all(zapFiles.map(findZapImports));
  const zapEntries = zapImportsZap.flatMap((item) =>
    item.map((entry) => ({
      plugin: entry.plugin,
      path: entry.path,
      type: classifyPlugin(entry.plugin),
    }))
  );

  const step2 = zapEntries
    .filter((x) => x.type === "core")
    .map(({ plugin, path: _path }) => ({ plugin, path: _path }));

  const step3 = zapEntries
    .filter((x) => x.type === "optional")
    .map(({ plugin, path: _path }) => ({ plugin, path: _path }));

  return { step2, step3 };
}

async function findCorePluginOptionalImports(
  step2: Array<{ plugin: PluginId; path: string }>
) {
  const corePluginOptionalImports: Array<{
    corePlugin: PluginId;
    optionalPlugin: PluginId;
    path: string;
  }> = [];

  for (const { plugin: corePlugin, path: coreFile } of step2) {
    const pluginDir = path.join(process.cwd(), "zap", corePlugin);
    if (!coreFile.startsWith(pluginDir)) {
      continue;
    }

    const imports = await findZapImports(coreFile);
    for (const { plugin: importedPlugin } of imports) {
      if (classifyPlugin(importedPlugin) === "optional") {
        corePluginOptionalImports.push({
          corePlugin,
          optionalPlugin: importedPlugin,
          path: coreFile.replace(`${process.cwd()}/`, ""),
        });
      }
    }
  }

  return corePluginOptionalImports;
}

function formatSummary(
  step1: Array<{ plugin: PluginId; path: string; type: string }>,
  step2: Array<{ plugin: PluginId; path: string }>,
  step3: Array<{ plugin: PluginId; path: string }>,
  step4: Array<{ corePlugin: PluginId; optionalPlugin: PluginId; path: string }>
): string {
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

  output += "\nStep 4 - Warnings: Optional plugins imported by core plugins:\n";
  if (step4.length === 0) {
    output += "- None found.\n";
  } else {
    for (const { corePlugin, optionalPlugin, path: _path } of step4) {
      output += `- Core plugin '${corePlugin}' imports optional plugin '${optionalPlugin}' in ${_path}\n`;
    }
  }

  return output;
}

async function getSrcDir(): Promise<string | null> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "zap.config.ts");
  if (await fs.pathExists(configPath)) {
    const srcDir = path.join(cwd, "src");
    if (await fs.pathExists(srcDir)) {
      return srcDir;
    }
  }
  return null;
}

async function getZapDir(): Promise<string | null> {
  const cwd = process.cwd();
  const zapDir = path.join(cwd, "zap");
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
