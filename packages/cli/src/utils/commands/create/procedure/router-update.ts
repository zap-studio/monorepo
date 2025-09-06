import path from "node:path";
import {
  type ObjectLiteralExpression,
  Project,
  type SourceFile,
} from "ts-morph";
import { FileSystemError } from "@/lib/errors.js";

async function saveRouterFile(sourceFile: SourceFile): Promise<void> {
  try {
    await sourceFile.save();
  } catch (error) {
    throw new FileSystemError(`Failed to save router file: ${error}`);
  }
}

function loadSourceFile(routerPath: string): SourceFile {
  try {
    const project = new Project();
    return project.addSourceFileAtPath(routerPath);
  } catch (error) {
    throw new FileSystemError(`Failed to load source file: ${error}`);
  }
}

function addImportDeclaration(
  sourceFile: SourceFile,
  kebabCaseName: string,
  procedureName: string
) {
  try {
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./procedures/${kebabCaseName}.rpc`,
      namedImports: [procedureName],
    });
    return sourceFile;
  } catch (error) {
    throw new FileSystemError(`Failed to add import declaration: ${error}`);
  }
}

function findRouterVariable(sourceFile: SourceFile) {
  const routerVar = sourceFile.getVariableDeclaration("router");
  if (!routerVar) {
    throw new Error("Could not find 'router' variable in router.ts");
  }
  return routerVar;
}

function getRouterInitializer(
  routerVar: ReturnType<SourceFile["getVariableDeclaration"]>
) {
  const initializer = routerVar?.getInitializer();
  if (!initializer) {
    throw new Error("Could not find initializer for 'router' variable");
  }
  return initializer as unknown as ObjectLiteralExpression;
}

function addProcedureToRouter(
  objectLiteral: ObjectLiteralExpression,
  procedureName: string
) {
  try {
    objectLiteral.addShorthandPropertyAssignment({ name: procedureName });
    return objectLiteral;
  } catch (error) {
    throw new FileSystemError(`Failed to add procedure to router: ${error}`);
  }
}

export async function updateRouterFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
): Promise<void> {
  try {
    const routerPath = path.join(projectDir, "src/rpc/router.ts");
    const sourceFile = loadSourceFile(routerPath);

    addImportDeclaration(sourceFile, kebabCaseName, procedureName);
    const routerVar = findRouterVariable(sourceFile);
    const objectLiteral = getRouterInitializer(routerVar);

    addProcedureToRouter(objectLiteral, procedureName);
    await saveRouterFile(sourceFile);
  } catch (error) {
    throw new FileSystemError(`Failed to update router file: ${error}`);
  }
}
