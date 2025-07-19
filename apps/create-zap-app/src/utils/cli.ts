import chalk from 'chalk';

export function displayWelcome(): void {
  process.stdout.write(
    chalk.bold.cyan(
      "\n🚀 Welcome to create-zap-app! Let's build something awesome.\n"
    )
  );
}

export function displayUsage(): void {
  process.stdout.write(chalk.red('Invalid command'));
  process.stdout.write(chalk.cyan('Usage:'));
  process.stdout.write(
    chalk.white('  pnpm dlx create-zap-app # Create new project')
  );
  process.stdout.write(
    chalk.white(
      '  pnpm dlx create-zap-app create procedure <name> # Create new procedure'
    )
  );
}

export function displayError(error: unknown): void {
  process.stderr.write(
    chalk.bold.red('\n❌ An error occurred: ') +
      (error instanceof Error ? error.message : String(error))
  );
}

export function displaySuccess(message: string): void {
  process.stdout.write(chalk.green(message));
}

export function displayInfo(message: string): void {
  process.stdout.write(chalk.cyan(message));
}

export function displayWarning(message: string): void {
  process.stdout.write(chalk.yellow(message));
}
