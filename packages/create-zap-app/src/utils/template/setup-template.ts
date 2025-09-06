import type { IDE } from "@zap-ts/architecture/types";
import type { Ora } from "ora";
import { getErrorMessage } from "@/utils/misc/error";
import {
  cleanupPackageJson,
  removeIDEConfigFiles,
  removeLockFiles,
} from "@/utils/template/cleanup.js";
import { downloadTemplate } from "@/utils/template/download.js";
import { extractTemplate } from "@/utils/template/extract.js";
import { finalizeTemplateFiles } from "@/utils/template/files.js";

export async function setupTemplate(
  params: {
    outputDir: string;
    ide: IDE | "all" | null;
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  try {
    const tarballPath = await downloadTemplate(params.outputDir);

    spinner.text = "Extracting Zap.ts template...";
    await extractTemplate(params.outputDir, tarballPath);
    await finalizeTemplateFiles(params.outputDir);
    await removeLockFiles(params.outputDir);
    await removeIDEConfigFiles(params.outputDir, params.ide);
    await cleanupPackageJson(params.outputDir);
  } catch (error) {
    spinner.fail("Failed to setup template.");
    if (verbose) {
      process.stderr.write(`${getErrorMessage(error)}\n`);
    }
  }
}
