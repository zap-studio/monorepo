import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { Effect, pipe } from 'effect';
import type { Ora } from 'ora';
import { ProcessExitError } from '@/lib/effect';

const execAsync = promisify(exec);

export function formatFiles(projectDir: string, spinner: Ora) {
  spinner.text = 'Formatting files...';
  spinner.start();

  const program = Effect.tryPromise(() =>
    execAsync('npm run format', { cwd: projectDir })
  );

  return pipe(
    program,
    Effect.catchAll((e) => {
      spinner.fail(`Failed to format files: ${String(e)}`);
      return Effect.fail(
        new ProcessExitError({ message: 'Formatting files failed' })
      );
    }),
    Effect.tap(() => {
      spinner.succeed('Files formatted.');
    })
  );
}
