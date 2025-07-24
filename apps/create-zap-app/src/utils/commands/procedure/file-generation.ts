import path from 'node:path';
import { Effect } from 'effect';
import fs from 'fs-extra';
import { toPascalCase } from './validation.js';

export function generateProcedureFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
) {
  const program = Effect.gen(function* () {
    const procedurePath = yield* Effect.try(() =>
      path.join(projectDir, 'src/rpc/procedures', `${kebabCaseName}.rpc.ts`)
    );

    const procedureContent = `
import { base } from "../middlewares";

export const ${procedureName} = base.handler(async () => {
  return { message: "Hello from ${procedureName}" };
});
  `.trim();

    yield* Effect.tryPromise(() => fs.ensureDir(path.dirname(procedurePath)));
    yield* Effect.tryPromise(() =>
      fs.writeFile(procedurePath, procedureContent)
    );
  });

  return program;
}

export function generateHookFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
) {
  const program = Effect.gen(function* () {
    const hookPath = yield* Effect.try(() =>
      path.join(projectDir, 'src/hooks', `use-${kebabCaseName}.ts`)
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

    yield* Effect.tryPromise(() => fs.ensureDir(path.dirname(hookPath)));
    yield* Effect.tryPromise(() => fs.writeFile(hookPath, hookContent));
  });

  return program;
}
