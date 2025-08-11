import { promises as fs } from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import { ValidationError } from '@/lib/errors';
import { exists } from '@/utils/template/files';
import { getAllPluginConfigs } from './plugin-utils';

/**
 * Check plugin dependencies against package.json
 */
export async function checkPluginDependencies(
  projectDir: string
): Promise<void> {
  const spinner = ora('Checking plugin dependencies...').start();

  const pluginConfigs = await getAllPluginConfigs(projectDir);
  const packageJsonPath = path.join(projectDir, 'package.json');

  if (!(await exists(packageJsonPath))) {
    spinner.fail('package.json not found');
    throw new ValidationError('package.json not found in project directory');
  }

  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const installedDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  spinner.succeed('Dependencies loaded');

  process.stdout.write('\nPlugin Dependencies Check:\n\n');

  let hasIssues = false;

  for (const { config } of pluginConfigs) {
    const allDeps = [
      ...config.dependencies.packages,
      ...config.dependencies.devPackages,
    ];
    const missing = allDeps.filter((dep) => !installedDeps[dep]);

    if (missing.length > 0) {
      hasIssues = true;
      process.stdout.write(`⚠️  ${config.name}:\n`);
      process.stdout.write(`   Missing dependencies: ${missing.join(', ')}\n`);
    } else {
      process.stdout.write(`✅ ${config.name}: All dependencies satisfied\n`);
    }
  }

  if (!hasIssues) {
    process.stdout.write('\nAll plugin dependencies are satisfied!\n');
  }
}

/**
 * Generate wrapper scripts for package.json
 */
export async function generateWrapperScripts(
  projectDir: string
): Promise<void> {
  const spinner = ora('Generating wrapper scripts...').start();

  const pluginConfigs = await getAllPluginConfigs(projectDir);
  const wrapperScripts: Record<string, string> = {};

  for (const { config } of pluginConfigs) {
    if (config.scripts) {
      for (const scriptName of Object.keys(config.scripts)) {
        const wrapperName = `${config.name}:${scriptName}`;
        wrapperScripts[wrapperName] =
          `zap plugin run ${config.name} ${scriptName}`;
      }
    }
  }

  if (Object.keys(wrapperScripts).length === 0) {
    spinner.fail('No plugin scripts found');
    process.stdout.write('No plugin scripts found to generate wrappers for.\n');
    return;
  }

  spinner.succeed(
    `Generated ${Object.keys(wrapperScripts).length} wrapper scripts`
  );

  process.stdout.write('\nGenerated wrapper scripts for package.json:\n\n');
  process.stdout.write('Add these to your package.json scripts section:\n\n');

  for (const [name, command] of Object.entries(wrapperScripts)) {
    process.stdout.write(`"${name}": "${command}",\n`);
  }
  process.stdout.write('\n');
}
