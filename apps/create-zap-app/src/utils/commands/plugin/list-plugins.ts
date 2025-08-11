import ora from 'ora';
import { getAllPluginConfigs } from './plugin-utils';

/**
 * List all available plugins with their details
 */
export async function listAllPlugins(projectDir: string): Promise<void> {
  const spinner = ora('Loading plugins...').start();

  const pluginConfigs = await getAllPluginConfigs(projectDir);

  if (pluginConfigs.length === 0) {
    spinner.fail('No plugins found');
    process.stdout.write('\nNo plugins found in the project.\n');
    return;
  }

  spinner.succeed(`Found ${pluginConfigs.length} plugins`);

  process.stdout.write('\n📦 Available Plugins:\n\n');

  for (const { config } of pluginConfigs) {
    const scriptCount = Object.keys(config.scripts || {}).length;
    process.stdout.write(`🔌 ${config.name}\n`);
    process.stdout.write(`   Description: ${config.description}\n`);
    process.stdout.write(`   Author: ${config.author}\n`);
    process.stdout.write(`   Scripts: ${scriptCount}\n`);
    process.stdout.write(
      `   Dependencies: ${config.required.dependencies.length}\n`
    );
    process.stdout.write(
      `   Dev Dependencies: ${config.required.devDependencies.length}\n`
    );
    process.stdout.write(
      `   Required Plugins: ${config.required.plugins.join(', ') || 'none'}\n`
    );
    process.stdout.write('\n');
  }

  process.stdout.write(`\nTotal: ${pluginConfigs.length} plugins\n`);
}
