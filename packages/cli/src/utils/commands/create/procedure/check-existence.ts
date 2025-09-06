import path from "node:path";
import fs from "fs-extra";
import { Project } from "ts-morph";
import { ValidationError } from "@/lib/errors.js";

export type ExistenceCheckResult = {
  procedureFileExists: boolean;
  hookFileExists: boolean;
  isInRouter: boolean;
  hasConflict: boolean;
};

export async function checkProcedureExists(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string
): Promise<ExistenceCheckResult> {
  const procedureFileExists = await checkProcedureFileExists(
    projectDir,
    kebabCaseName
  );
  const hookFileExists = await checkHookFileExists(projectDir, kebabCaseName);
  const isInRouter = await checkRouterContainsProcedure(
    projectDir,
    validatedName
  );

  const hasConflict = procedureFileExists || hookFileExists || isInRouter;

  return {
    procedureFileExists,
    hookFileExists,
    isInRouter,
    hasConflict,
  };
}

async function checkProcedureFileExists(
  projectDir: string,
  kebabCaseName: string
): Promise<boolean> {
  const procedurePath = path.join(
    projectDir,
    "src/rpc/procedures",
    `${kebabCaseName}.rpc.ts`
  );
  return await fs.pathExists(procedurePath);
}

async function checkHookFileExists(
  projectDir: string,
  kebabCaseName: string
): Promise<boolean> {
  const hookPath = path.join(
    projectDir,
    "src/hooks/rpc",
    `use-${kebabCaseName}.ts`
  );
  return await fs.pathExists(hookPath);
}

async function checkRouterContainsProcedure(
  projectDir: string,
  procedureName: string
): Promise<boolean> {
  try {
    const routerPath = path.join(projectDir, "src/rpc/router.ts");

    if (!(await fs.pathExists(routerPath))) {
      return false;
    }

    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(routerPath);

    const importDeclarations = sourceFile.getImportDeclarations();
    const hasImport = importDeclarations.some((importDecl) => {
      const namedImports = importDecl.getNamedImports();
      return namedImports.some(
        (namedImport) => namedImport.getName() === procedureName
      );
    });

    if (hasImport) {
      return true;
    }

    const routerVar = sourceFile.getVariableDeclaration("router");
    if (!routerVar) {
      return false;
    }

    const initializer = routerVar.getInitializer();
    if (!initializer) {
      return false;
    }

    const routerText = initializer.getText();
    return routerText.includes(procedureName);
  } catch {
    throw new ValidationError(
      `Failed to check router for procedure '${procedureName}'`
    );
  }
}

export function createExistenceMessage(
  validatedName: string,
  kebabCaseName: string,
  existenceResult: ExistenceCheckResult
): string | null {
  if (!existenceResult.hasConflict) {
    return null;
  }

  const conflicts: string[] = [];

  if (existenceResult.procedureFileExists) {
    conflicts.push(
      `• Procedure file 'src/rpc/procedures/${kebabCaseName}.rpc.ts' already exists`
    );
  }

  if (existenceResult.hookFileExists) {
    conflicts.push(
      `• Hook file 'src/hooks/rpc/use-${kebabCaseName}.ts' already exists`
    );
  }

  if (existenceResult.isInRouter) {
    conflicts.push(
      `• Procedure '${validatedName}' is already registered in the router`
    );
  }

  return `Procedure '${validatedName}' already exists:\n${conflicts.join("\n")}`;
}
