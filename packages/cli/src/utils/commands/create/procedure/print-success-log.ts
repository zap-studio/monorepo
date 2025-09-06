import chalk from "chalk";

export function printSuccessLogs(
  validatedName: string,
  kebabCaseName: string
): void {
  process.stdout.write(
    chalk.green(`Successfully created ${validatedName} procedure!\n`)
  );
  process.stdout.write(chalk.cyan("\nFiles created:\n"));
  process.stdout.write(
    chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts\n`)
  );
  process.stdout.write(chalk.white(`- src/hooks/use-${kebabCaseName}.ts\n`));
  process.stdout.write(chalk.white("\nRouter updated:\n"));
  process.stdout.write(chalk.white("- src/rpc/router.ts\n"));
}
