import fs from "fs-extra";
import {
  analyzeSrcPlugins,
  analyzeZapPlugins,
  findCorePluginOptionalImports,
} from "./plugin-analysis.js";
import { summarizePluginDependencies } from "./plugin-deps.js";
import { formatSummary } from "./plugin-summary.js";
import { getSrcDir } from "./plugin-utils";

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
  const step4 = await findCorePluginOptionalImports();

  const corePluginSummary = summarizePluginDependencies(step2);
  const optionalPluginSummary = summarizePluginDependencies(step3);

  const steps = { step1, step2, step3, step4 };
  const output = formatSummary(steps, corePluginSummary, optionalPluginSummary);

  if (options.output) {
    await fs.writeFile(options.output, output, "utf8");
    process.stdout.write(`Summary written to ${options.output}\n`);
  } else {
    process.stdout.write(output);
  }
}
