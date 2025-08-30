import path from 'node:path';
import fs from 'fs-extra';
import { FileSystemError } from '@/lib/errors.js';
import { toPascalCase } from './validation.js';

export async function generateProcedureFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
): Promise<void> {
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
): Promise<void> {
  try {
    const hookPath = path.join(
      projectDir,
      'src/hooks/rpc',
      `use-${kebabCaseName}.ts`
    );

    const capitalizedProcedureName = toPascalCase(procedureName);
    const hookContent = `
"use client";

import { useZapQuery } from "@/zap/api/hooks";
import { orpcQuery } from "@/zap/api/providers/orpc/client";

export const use${capitalizedProcedureName} = () => {
  return useZapQuery(
    orpcQuery.${procedureName}.queryOptions()
  );
};
  `.trim();

    await fs.ensureDir(path.dirname(hookPath));
    await fs.writeFile(hookPath, hookContent);
  } catch (error) {
    throw new FileSystemError(`Failed to generate hook file: ${error}`);
  }
}
