// packages/utils/modify-providers.ts
import { Project } from "ts-morph";
import path from "path";

/**
 * Adds the `usePwa` hook to the `Providers` function in `providers.tsx`.
 *
 * This function modifies the `providers.tsx` file in the specified output directory.
 * If PWA is enabled, it adds the `usePwa` import from `@/plugins/pwa` and inserts a
 * `usePwa()` call at the top of the `Providers` function body.
 *
 * @param outputDir - The directory containing the `src/providers/providers.tsx` file.
 * @param isPwaEnabled - A boolean indicating whether the PWA plugin is enabled.
 *
 * @throws {Error} If the `Providers` function is not found in `providers.tsx`.
 */
export async function addPwaInit(outputDir: string, isPwaEnabled: boolean) {
  const project = new Project();
  const providersPath = path.join(outputDir, "src/providers/providers.tsx");
  const sourceFile = project.addSourceFileAtPath(providersPath);

  // Add import for usePwa if PWA is enabled
  if (isPwaEnabled) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@/plugins/pwa",
      namedImports: ["usePwa"],
    });
  }

  // Find the Providers function
  const functionDeclaration = sourceFile.getFunction("Providers");
  if (!functionDeclaration) {
    throw new Error("Providers function not found in providers.tsx");
  }

  // Add usePwa() call at the top of the function body if PWA is enabled
  if (isPwaEnabled) {
    functionDeclaration.insertStatements(0, "usePwa();");
  }

  // Save the modified file
  await sourceFile.save();
}
