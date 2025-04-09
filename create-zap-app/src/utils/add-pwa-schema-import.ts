import { Project } from "ts-morph";
import path from "path";

/**
 * Adds the PWA schema export to `src/db/schema/index.ts`.
 *
 * This function modifies the `index.ts` file in the specified output directory's
 * `src/db/schema/` folder. If PWA is enabled, it adds an export statement for the
 * notifications schema.
 *
 * @param outputDir - The directory containing the `src/db/schema/index.ts` file.
 * @param isPwaEnabled - A boolean indicating whether the PWA plugin is enabled.
 *
 * @throws {Error} If the `index.ts` file cannot be found or modified.
 */
export const addPwaSchemaExport = async (
  outputDir: string,
  isPwaEnabled: boolean
) => {
  const project = new Project();
  const schemaIndexPath = path.join(outputDir, "src/db/schema/index.ts");
  const sourceFile = project.addSourceFileAtPath(schemaIndexPath);

  // Add export * from "@/db/schema/notifications" if PWA is enabled
  if (isPwaEnabled) {
    sourceFile.addExportDeclaration({
      moduleSpecifier: "@/db/schema/notifications",
      isTypeOnly: false, // Ensure it's a value export, not just types
    });
  }

  // Save the modified file
  await sourceFile.save();
};
