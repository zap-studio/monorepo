import chalk from 'chalk';
import { Console } from 'effect';

export function printSuccessLogs(validatedName: string, kebabCaseName: string) {
  Console.log(
    chalk.green(`Successfully created ${validatedName} procedure!\n`)
  );
  Console.log(chalk.cyan('\nFiles created:\n'));
  Console.log(chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts\n`));
  Console.log(chalk.white(`- src/hooks/use-${kebabCaseName}.ts\n`));
  Console.log(chalk.white('\nRouter updated:\n'));
  Console.log(chalk.white('- src/rpc/router.ts\n'));
}
