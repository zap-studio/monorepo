import path from "node:path";
import type { CorePluginId, PluginId } from "@zap-ts/architecture/types";
import { getCorePlugins } from "@zap-ts/architecture/utils/plugins";
import fs from "fs-extra";
import {
  addTypeToEntry,
  classifyPlugin,
  compareCoreOptionalPlugin,
  dedupePluginEntries,
  findZapImports,
  getAllFiles,
  getZapDir,
  sortByPluginAndPath,
  sortByTypeAndPlugin,
} from "./plugin-utils.js";

export async function analyzeSrcPlugins(srcDir: string): Promise<
  {
    plugin: PluginId;
    path: string;
    type: "core" | "optional" | "unknown";
  }[]
> {
  const srcFiles = await getAllFiles(srcDir);
  const zapImports = (await Promise.all(srcFiles.map(findZapImports))).flat();
  const imports = dedupePluginEntries(zapImports.map(addTypeToEntry));
  return sortByTypeAndPlugin(imports);
}

export async function analyzeZapPlugins(): Promise<{
  corePlugins: {
    plugin: PluginId;
    path: string;
  }[];
  optionalPlugins: {
    plugin: PluginId;
    path: string;
  }[];
}> {
  const zapDir = await getZapDir();
  if (!zapDir) {
    process.stdout.write("No zap/ directory found in current directory.\n");
    process.exit(1);
  }
  const zapFiles = await getAllFiles(zapDir);
  const zapEntries = dedupePluginEntries(
    (await Promise.all(zapFiles.map(findZapImports))).flat().map(addTypeToEntry)
  );
  const corePlugins = sortByPluginAndPath(
    zapEntries.filter((x) => x.type === "core")
  );
  const optionalPlugins = sortByPluginAndPath(
    zapEntries.filter((x) => x.type === "optional")
  );
  return { corePlugins, optionalPlugins };
}

export async function findCorePluginOptionalImports(): Promise<
  {
    corePlugin: PluginId;
    optionalPlugin: PluginId;
    path: string;
  }[]
> {
  const results: Array<{
    corePlugin: PluginId;
    optionalPlugin: PluginId;
    path: string;
  }> = [];
  const corePluginIds: CorePluginId[] = getCorePlugins();
  for (const corePluginId of corePluginIds) {
    const pluginPath = path.join(process.cwd(), "zap", corePluginId);
    if (!(await fs.pathExists(pluginPath))) {
      continue;
    }
    const pluginFiles = await getAllFiles(pluginPath);
    for (const file of pluginFiles) {
      const imports = await findZapImports(file);
      for (const { plugin: importedPlugin } of imports) {
        if (classifyPlugin(importedPlugin) === "optional") {
          results.push({
            corePlugin: corePluginId,
            optionalPlugin: importedPlugin,
            path: file.replace(`${process.cwd()}/`, ""),
          });
        }
      }
    }
  }
  return results.sort(compareCoreOptionalPlugin);
}
