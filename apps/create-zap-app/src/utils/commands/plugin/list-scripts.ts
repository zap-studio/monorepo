import ora from 'ora';
import { PluginError } from '@/lib/errors';
import { findPluginConfig, getAllPluginConfigs } from './plugin-utils';

/**
 * List scripts for a specific plugin
 */
export async function listPluginScripts(
  projectDir: string,
  pluginName?: string
): Promise<void> {
  if (!pluginName) {
    throw new PluginError('Plugin name is required');
  }

  const spinner = ora(`Loading plugin ${pluginName}...`).start();

  const pluginConfig = await findPluginConfig(projectDir, pluginName);

  if (!pluginConfig) {
    spinner.fail(`Plugin '${pluginName}' not found`);
    throw new PluginError(`Plugin '${pluginName}' not found`);
  }

  const scripts = pluginConfig.scripts || {};
  spinner.succeed(`Found plugin: ${pluginName}`);

  process.stdout.write(`\nAvailable scripts for plugin '${pluginName}':\n`);

  if (Object.keys(scripts).length === 0) {
    process.stdout.write('  No scripts defined\n');
  } else {
    for (const [name, command] of Object.entries(scripts)) {
      process.stdout.write(`  ${name}: ${command}\n`);
    }
  }
  process.stdout.write('\n');
}

/**
 * List all scripts from all plugins
 */
export async function listAllScripts(projectDir: string): Promise<void> {
  const spinner = ora('Loading all plugin scripts...').start();

  const pluginConfigs = await getAllPluginConfigs(projectDir);

  if (pluginConfigs.length === 0) {
    spinner.fail('No plugins found');
    return;
  }

  spinner.succeed(`Found ${pluginConfigs.length} plugins`);

  process.stdout.write('\nAll Plugin Scripts:\n\n');

  for (const { name, config } of pluginConfigs) {
    const scripts = config.scripts || {};
    if (Object.keys(scripts).length > 0) {
      process.stdout.write(`🔌 ${name}:\n`);
      for (const [scriptName, command] of Object.entries(scripts)) {
        process.stdout.write(`   ${scriptName}: ${command}\n`);
      }
      process.stdout.write('\n');
    }
  }
}
