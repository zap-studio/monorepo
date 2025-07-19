import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { Effect } from 'effect';
import fs from 'fs-extra';
import ora from 'ora';
import { type ObjectLiteralExpression, Project } from 'ts-morph';

const execAsync = promisify(exec);

export function createProcedureEffect(
  procedureName: string
): Effect.Effect<void, unknown, never> {
  return Effect.gen(function* (_) {
    const projectDir = process.cwd();
    const spinner = ora(`Creating procedure ${procedureName}...`).start();

    // Convert procedureName to kebab-case
    const kebabCaseName = procedureName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();

    // Generate procedure file
    const procedurePath = path.join(
      projectDir,
      'src/rpc/procedures',
      `${kebabCaseName}.rpc.ts`
    );
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(procedurePath)),
        catch: (e) => {
          spinner.fail(`Failed to ensure procedure directory: ${String(e)}`);
          process.exit(1);
        },
      })
    );

    const procedureContent = `
import { base } from "../middlewares";

export const ${procedureName} = base.handler(async () => {
  return { message: "Hello from ${procedureName}" };
});
    `.trim();

    yield* _(
      Effect.tryPromise({
        try: () => fs.writeFile(procedurePath, procedureContent),
        catch: (e) => {
          spinner.fail(`Failed to write procedure file: ${String(e)}`);
          process.exit(1);
        },
      })
    );
    spinner.succeed(`Created ${kebabCaseName}.rpc.ts`);

    // Update router.ts
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
      spinner.fail("Could not find 'router' variable in router.ts");
      process.exit(1);
    }

    // Get the initializer
    const initializer = routerVar.getInitializer();

    if (!initializer) {
      spinner.fail("Could not find initializer for 'router' variable");
      process.exit(1);
    }

    // Add procedure to router object
    const objectLiteral = initializer as unknown as ObjectLiteralExpression;
    objectLiteral.addShorthandPropertyAssignment({ name: procedureName });

    yield* _(
      Effect.tryPromise({
        try: () => sourceFile.save(),
        catch: (e) => {
          spinner.fail(`Failed to save router.ts: ${String(e)}`);
          process.exit(1);
        },
      })
    );
    process.stdout.write(chalk.green('Updated router.ts'));

    // Create hook file
    const hookPath = path.join(
      projectDir,
      'src/hooks',
      `use-${kebabCaseName}.ts`
    );
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(hookPath)),
        catch: (e) => {
          spinner.fail(`Failed to ensure hook directory: ${String(e)}`);
          process.exit(1);
        },
      })
    );

    const capitalizedProcedureName =
      procedureName.charAt(0).toUpperCase() + procedureName.slice(1);
    const hookContent = `
"use client";

import { useORPC } from "@/zap/stores/orpc.store";
import useSWR from "swr";

export const use${capitalizedProcedureName} = () => {
  const orpc = useORPC();
  return useSWR(orpc.${procedureName}.key(), orpc.${procedureName}.queryOptions().queryFn);
};
    `.trim();

    yield* _(
      Effect.tryPromise({
        try: () => fs.writeFile(hookPath, hookContent),
        catch: (e) => {
          spinner.fail(`Failed to write hook file: ${String(e)}`);
          process.exit(1);
        },
      })
    );
    process.stdout.write(chalk.green(`Created use-${kebabCaseName}.ts`));

    // Format files
    spinner.text = 'Formatting files...';
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () => execAsync('npm run format', { cwd: projectDir }),
        catch: (e) => {
          spinner.fail(`Failed to format files: ${String(e)}`);
          process.exit(1);
        },
      })
    );
    spinner.succeed('Files formatted.');

    process.stdout.write(
      chalk.green(`Successfully created ${procedureName} procedure!`)
    );
    process.stdout.write(chalk.cyan('\nFiles created:'));
    process.stdout.write(
      chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts`)
    );
    process.stdout.write(chalk.white(`- src/hooks/use-${kebabCaseName}.ts`));
    process.stdout.write(chalk.white('\nRouter updated:'));
    process.stdout.write(chalk.white('- src/rpc/router.ts'));
  });
}
