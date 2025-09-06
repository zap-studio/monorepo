import fs from "fs-extra";
import {
  analyzeSrcPlugins,
  analyzeZapPlugins,
  findCorePluginOptionalImports,
} from "./plugin-analysis.js";
import {
  buildPluginImportMap,
  summarizeCorePluginDependencies,
  summarizeOptionalPluginDependencies,
} from "./plugin-deps.js";
import { formatSummary } from "./plugin-summary.js";
import {
  addTypeToEntry,
  dedupePluginEntries,
  findZapImports,
  getAllFiles,
  getSrcDir,
  getZapDir,
} from "./plugin-utils";

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

  const zapDir = await getZapDir();
  const zapFiles = zapDir ? await getAllFiles(zapDir) : [];
  const allPluginEntries = dedupePluginEntries(
    (await Promise.all(zapFiles.map(findZapImports))).flat().map(addTypeToEntry)
  );

  const importMap = await buildPluginImportMap(allPluginEntries);
  const corePluginSummary = summarizeCorePluginDependencies(step2, importMap);
  const optionalPluginSummary = summarizeOptionalPluginDependencies(
    step3,
    importMap
  );

  const steps = { step1, step2, step3, step4 };
  const output = formatSummary(steps, corePluginSummary, optionalPluginSummary);

  if (options.output) {
    await fs.writeFile(options.output, output, "utf8");
    process.stdout.write(`Summary written to ${options.output}\n`);
  } else {
    process.stdout.write(output);
  }
}
