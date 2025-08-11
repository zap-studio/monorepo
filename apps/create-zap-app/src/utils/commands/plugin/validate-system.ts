import { promises as fs } from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import { ValidationError } from '@/lib/errors';
import type { PluginConfig } from '@/types/plugin';
import { exists } from '@/utils/template/files';
import { getAllPluginConfigs, getAllPlugins } from './plugin-utils';

interface ValidationResult {
  name: string;
  scriptCount: number;
  valid: boolean;
  error?: string;
}

interface ValidationSummary {
  totalPlugins: number;
  validPlugins: number;
  pluginsWithScripts: number;
  totalScripts: number;
  hasPackageJson: boolean;
  hasPluginRunner: boolean;
}

/**
 * Validate plugin configurations and count scripts
 */
function validatePluginConfigs(
  plugins: string[],
  pluginConfigs: Array<{ name: string; config: PluginConfig }>
): {
  results: ValidationResult[];
  pluginsWithScripts: number;
  totalScripts: number;
} {
  let pluginsWithScripts = 0;
  let totalScripts = 0;
  const results: ValidationResult[] = [];

  for (const pluginName of plugins) {
    try {
      const config = pluginConfigs.find((p) => p.name === pluginName)?.config;

      if (config) {
        const scriptCount = Object.keys(config.scripts || {}).length;

        if (scriptCount > 0) {
          pluginsWithScripts++;
          totalScripts += scriptCount;
        }

        results.push({
          name: pluginName,
          scriptCount,
          valid: true,
        });
      } else {
        results.push({
          name: pluginName,
          scriptCount: 0,
          valid: false,
          error: 'Configuration not found',
        });
      }
    } catch (error) {
      results.push({
        name: pluginName,
        scriptCount: 0,
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { results, pluginsWithScripts, totalScripts };
}

/**
 * Check package.json for plugin runner configuration
 */
async function checkPackageJson(projectDir: string): Promise<{
  hasPackageJson: boolean;
  hasPluginRunner: boolean;
}> {
  const packageJsonPath = path.join(projectDir, 'package.json');
  let hasPackageJson = false;
  let hasPluginRunner = false;

  if (await exists(packageJsonPath)) {
    hasPackageJson = true;
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      hasPluginRunner = Boolean(packageJson.scripts?.zap);
    } catch {
      // Ignore package.json parsing errors
    }
  }

  return { hasPackageJson, hasPluginRunner };
}

/**
 * Display plugin status
 */
function displayPluginStatus(results: ValidationResult[]): void {
  process.stdout.write(' Plugin Status:\n');
  for (const result of results) {
    if (result.valid) {
      process.stdout.write(
        `✅ ${result.name}: ${result.scriptCount} scripts\n`
      );
    } else {
      process.stdout.write(`❌ ${result.name}: ${result.error || 'Invalid'}\n`);
    }
  }
}

/**
 * Display validation summary
 */
function displaySummary(summary: ValidationSummary): void {
  process.stdout.write('\nSummary:\n');
  process.stdout.write(`   Total plugins found: ${summary.totalPlugins}\n`);
  process.stdout.write(`   Valid plugins: ${summary.validPlugins}\n`);
  process.stdout.write(
    `   Plugins with scripts: ${summary.pluginsWithScripts}\n`
  );
  process.stdout.write(`   Total scripts: ${summary.totalScripts}\n`);

  if (summary.hasPackageJson) {
    if (summary.hasPluginRunner) {
      process.stdout.write(
        '   Plugin runner configured in package.json (✅)\n'
      );
    } else {
      process.stdout.write('   No plugin runner found in package.json (⚠️)\n');
    }
  } else {
    process.stdout.write('   No package.json found (ℹ️)\n');
  }
}

/**
 * Display validation results
 */
function displayValidationResults(
  results: ValidationResult[],
  summary: ValidationSummary
): void {
  displayPluginStatus(results);
  displaySummary(summary);

  process.stdout.write('\nPlugin system validation complete!\n');
}

/**
 * Validate the plugin system integrity
 */
export async function validatePluginSystem(projectDir: string): Promise<void> {
  const spinner = ora('Validating plugin system...').start();

  // Check if zap directory exists
  const zapDir = path.join(projectDir, 'zap');
  if (!(await exists(zapDir))) {
    spinner.fail('Zap directory not found');
    throw new ValidationError('Zap directory not found in project');
  }

  // Get plugin data
  const plugins = await getAllPlugins(projectDir);
  const pluginConfigs = await getAllPluginConfigs(projectDir);

  // Validate configurations
  const { results, pluginsWithScripts, totalScripts } = validatePluginConfigs(
    plugins,
    pluginConfigs
  );

  // Check package.json
  const { hasPackageJson, hasPluginRunner } =
    await checkPackageJson(projectDir);

  spinner.succeed('Plugin system validation complete');

  const summary: ValidationSummary = {
    totalPlugins: plugins.length,
    validPlugins: results.filter((r) => r.valid).length,
    pluginsWithScripts,
    totalScripts,
    hasPackageJson,
    hasPluginRunner,
  };

  displayValidationResults(results, summary);
}
