import path from 'node:path';
import fs from 'fs-extra';
import { FileSystemError } from '@/lib/errors';
import { toPascalCase } from './validation.js';

export async function generateProcedureFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
) {
  try {
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

    await fs.ensureDir(path.dirname(procedurePath));
    await fs.writeFile(procedurePath, procedureContent);
  } catch (error) {
    throw new FileSystemError(`Failed to generate procedure file: ${error}`);
  }
}

export async function generateHookFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
) {
  try {
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

    await fs.ensureDir(path.dirname(hookPath));
    await fs.writeFile(hookPath, hookContent);
  } catch (error) {
    throw new FileSystemError(`Failed to generate hook file: ${error}`);
  }
}
