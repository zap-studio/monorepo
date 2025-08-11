import { spawn } from 'node:child_process';
import path from 'node:path';
import { CommandExecutionError } from '@/lib/errors';
import { findPluginConfig } from './plugin-utils';

/**
 * Execute a command using child_process.spawn
 */
function executeCommand(
  command: string,
  cwd: string,
  args: string[] = []
): Promise<number> {
  return new Promise((resolve) => {
    const [cmd, ...cmdArgs] = command.split(' ');
    const allArgs = [...cmdArgs, ...args];

    const isLocalPackage = !(
      cmd.startsWith('./') ||
      cmd.startsWith('/') ||
      cmd.includes('/')
    );
    const finalCmd = isLocalPackage ? 'npx' : cmd;
    const finalArgs = isLocalPackage ? [cmd, ...allArgs] : allArgs;

    const child = spawn(finalCmd, finalArgs, {
      stdio: 'inherit',
      shell: false,
      cwd,
      env: {
        ...process.env,
        PATH: `${path.join(cwd, 'node_modules', '.bin')}:${process.env.PATH}`,
      },
    });

    child.on('exit', (code) => {
      resolve(code ?? 0);
    });

    child.on('error', (error) => {
      process.stderr.write(`❌ Error executing command: ${error.message}\n`);
      resolve(1);
    });
  });
}

/**
 * Run a plugin script
 */
export async function runPluginScript(
  projectDir: string,
  pluginName: string,
  scriptName: string,
  fallbackCommand?: string,
  args: string[] = []
): Promise<void> {
  const pluginConfig = await findPluginConfig(projectDir, pluginName);

  if (!pluginConfig) {
    if (fallbackCommand) {
      process.stdout.write(
        `⚠️  Plugin '${pluginName}' not found, running fallback: ${fallbackCommand}\n`
      );
      const exitCode = await executeCommand(fallbackCommand, projectDir, args);

      if (exitCode !== 0) {
        throw new CommandExecutionError(
          `Fallback command failed with exit code ${exitCode}`
        );
      }
    } else {
      throw new CommandExecutionError(
        `Plugin '${pluginName}' not found and no fallback provided`
      );
    }
    return;
  }

  if (!pluginConfig.scripts?.[scriptName]) {
    if (fallbackCommand) {
      process.stdout.write(
        `⚠️  Script '${scriptName}' not found in plugin '${pluginName}', running fallback: ${fallbackCommand}\n`
      );
      const exitCode = await executeCommand(fallbackCommand, projectDir, args);

      if (exitCode !== 0) {
        throw new CommandExecutionError(
          `Fallback command failed with exit code ${exitCode}`
        );
      }
    } else {
      throw new CommandExecutionError(
        `Script '${scriptName}' not found in plugin '${pluginName}' and no fallback provided`
      );
    }
    return;
  }

  const scriptCommand = pluginConfig.scripts[scriptName];
  const exitCode = await executeCommand(scriptCommand, projectDir, args);

  if (exitCode !== 0) {
    throw new CommandExecutionError(
      `Script '${scriptName}' in plugin '${pluginName}' failed with exit code ${exitCode}`
    );
  }
}
