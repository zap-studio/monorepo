import path from 'node:path';
import { Effect } from 'effect';
import fs from 'fs-extra';
import { toPascalCase } from './validation.js';

function ensureDir(procedurePath: string) {
  return Effect.tryPromise(() => fs.ensureDir(path.dirname(procedurePath)));
}

function writeFile(procedurePath: string, procedureContent: string) {
  return Effect.tryPromise(() => fs.writeFile(procedurePath, procedureContent));
}

export function generateProcedureFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
) {
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

  return Effect.gen(function* () {
    yield* ensureDir(path.dirname(procedurePath));
    yield* writeFile(procedurePath, procedureContent);
  });
}

export function generateHookFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
) {
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

  return Effect.gen(function* () {
    yield* ensureDir(path.dirname(hookPath));
    yield* writeFile(hookPath, hookContent);
  });
}
