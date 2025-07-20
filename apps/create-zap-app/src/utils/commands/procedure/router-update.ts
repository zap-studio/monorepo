import path from 'node:path';
import { Effect } from 'effect';
import { type ObjectLiteralExpression, Project } from 'ts-morph';

/**
 * Updates the router.ts file to include the new procedure.
 *
 * This function:
 * 1. Adds an import statement for the new procedure
 * 2. Adds the procedure to the router object as a shorthand property
 *
 * @param projectDir - The root directory of the project
 * @param procedureName - The original procedure name (camelCase)
 * @param kebabCaseName - The kebab-case version of the procedure name for the import path
 * @returns An Effect that resolves when the router file is successfully updated
 *
 * @throws {Error} If the router variable or its initializer cannot be found
 *
 * @example
 * ```typescript
 * const effect = updateRouterFile(
 *   "/path/to/project",
 *   "getUserData",
 *   "get-user-data"
 * );
 * // Updates src/rpc/router.ts to include:
 * // import { getUserData } from "./procedures/get-user-data.rpc";
 * // router: { getUserData, ... }
 * ```
 */
export function updateRouterFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
): Effect.Effect<void, Error, never> {
  return Effect.gen(function* (_) {
    const routerPath = path.join(projectDir, 'src/rpc/router.ts');
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(routerPath);

    // Add import
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./procedures/${kebabCaseName}.rpc`,
      namedImports: [procedureName],
    });

    // Find router object and add procedure
    const routerVar = sourceFile.getVariableDeclaration('router');
    if (!routerVar) {
      throw new Error("Could not find 'router' variable in router.ts");
    }

    // Get the initializer
    const initializer = routerVar.getInitializer();
    if (!initializer) {
      throw new Error("Could not find initializer for 'router' variable");
    }

    // Add procedure to router object
    const objectLiteral = initializer as unknown as ObjectLiteralExpression;
    objectLiteral.addShorthandPropertyAssignment({ name: procedureName });

    yield* _(
      Effect.tryPromise({
        try: () => sourceFile.save(),
        catch: (e) => new Error(`Failed to save router.ts: ${String(e)}`),
      })
    );
  });
}
