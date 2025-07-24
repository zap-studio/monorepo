import path from 'node:path';
import { Effect } from 'effect';
import {
  type ObjectLiteralExpression,
  Project,
  type SourceFile,
} from 'ts-morph';

function saveRouterFile(sourceFile: SourceFile) {
  return Effect.tryPromise(() => sourceFile.save());
}

function loadSourceFile(routerPath: string) {
  return Effect.try(() => {
    const project = new Project();
    return project.addSourceFileAtPath(routerPath);
  });
}

function addImportDeclaration(
  sourceFile: SourceFile,
  kebabCaseName: string,
  procedureName: string
) {
  return Effect.try(() => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./procedures/${kebabCaseName}.rpc`,
      namedImports: [procedureName],
    });
    return sourceFile;
  });
}

function findRouterVariable(sourceFile: SourceFile) {
  return Effect.gen(function* () {
    const routerVar = sourceFile.getVariableDeclaration('router');
    if (!routerVar) {
      return yield* Effect.fail(
        new Error("Could not find 'router' variable in router.ts")
      );
    }
    return routerVar;
  });
}

function getRouterInitializer(
  routerVar: ReturnType<SourceFile['getVariableDeclaration']>
) {
  return Effect.gen(function* () {
    const initializer = routerVar?.getInitializer();
    if (!initializer) {
      return yield* Effect.fail(
        new Error("Could not find initializer for 'router' variable")
      );
    }
    return initializer as unknown as ObjectLiteralExpression;
  });
}

function addProcedureToRouter(
  objectLiteral: ObjectLiteralExpression,
  procedureName: string
) {
  return Effect.try(() => {
    objectLiteral.addShorthandPropertyAssignment({ name: procedureName });
    return objectLiteral;
  });
}

export function updateRouterFile(
  projectDir: string,
  procedureName: string,
  kebabCaseName: string
) {
  return Effect.gen(function* () {
    const routerPath = yield* Effect.try(() =>
      path.join(projectDir, 'src/rpc/router.ts')
    );
    const sourceFile = yield* loadSourceFile(routerPath);

    yield* addImportDeclaration(sourceFile, kebabCaseName, procedureName);
    const routerVar = yield* findRouterVariable(sourceFile);
    const objectLiteral = yield* getRouterInitializer(routerVar);

    yield* addProcedureToRouter(objectLiteral, procedureName);
    yield* saveRouterFile(sourceFile);
  });
}
