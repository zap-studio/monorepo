import path from 'node:path';
import { Effect } from 'effect';
import fs from 'fs-extra';
import { toPascalCase } from './validation.js';

/**
 * Generates a new RPC procedure file with the standard template.
 *
 * Creates the procedure file at `src/rpc/procedures/{kebabCaseName}.rpc.ts` with:
 * - Import of the base middleware
 * - Exported procedure handler with a default message response
 *
 * @param projectDir - The root directory of the project
 * @param procedureName - The original procedure name (camelCase)
 * @param kebabCaseName - The kebab-case version of the procedure name for the filename
 * @returns An Effect that resolves when the file is successfully created
 *
 * @example
 * ```typescript
 * const effect = generateProcedureFile(
 *   "/path/to/project",
 *   "getUserData",
 *   "get-user-data"
 * );
 * // Creates: src/rpc/procedures/get-user-data.rpc.ts
 * ```
 */
export function generateProcedureFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
): Effect.Effect<void, Error, never> {
  const procedurePath = path.join(
    projectDir,
    'src/rpc/procedures',
    `${kebabCaseName}.rpc.ts`
  );

  const procedureContent = `
import { base } from "../middlewares";

export const ${procedureName} = base.handler(async () => {
  return { message: "Hello from ${procedureName}" };
});
  `.trim();

  return Effect.gen(function* (_) {
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(procedurePath)),
        catch: (e) =>
          new Error(`Failed to ensure procedure directory: ${String(e)}`),
      })
    );

    yield* _(
      Effect.tryPromise({
        try: () => fs.writeFile(procedurePath, procedureContent),
        catch: (e) => new Error(`Failed to write procedure file: ${String(e)}`),
      })
    );
  });
}

/**
 * Generates a React hook file for the RPC procedure.
 *
 * Creates the hook file at `src/hooks/use-{kebabCaseName}.ts` with:
 * - Client-side directive
 * - Import of ORPC store and SWR
 * - Exported hook that uses SWR for data fetching
 *
 * @param projectDir - The root directory of the project
 * @param procedureName - The original procedure name (camelCase)
 * @param kebabCaseName - The kebab-case version of the procedure name for the filename
 * @returns An Effect that resolves when the file is successfully created
 *
 * @example
 * ```typescript
 * const effect = generateHookFile(
 *   "/path/to/project",
 *   "getUserData",
 *   "get-user-data"
 * );
 * // Creates: src/hooks/use-get-user-data.ts
 * // Exports: useGetUserData hook
 * ```
 */
export function generateHookFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
): Effect.Effect<void, Error, never> {
  const hookPath = path.join(
    projectDir,
    'src/hooks',
    `use-${kebabCaseName}.ts`
  );

  const capitalizedProcedureName = toPascalCase(procedureName);
  const hookContent = `
"use client";

import { useORPC } from "@/zap/stores/orpc.store";
import useSWR from "swr";

export const use${capitalizedProcedureName} = () => {
  const orpc = useORPC();
  return useSWR(orpc.${procedureName}.key(), orpc.${procedureName}.queryOptions().queryFn);
};
  `.trim();

  return Effect.gen(function* (_) {
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(hookPath)),
        catch: (e) =>
          new Error(`Failed to ensure hook directory: ${String(e)}`),
      })
    );

    yield* _(
      Effect.tryPromise({
        try: () => fs.writeFile(hookPath, hookContent),
        catch: (e) => new Error(`Failed to write hook file: ${String(e)}`),
      })
    );
  });
}
