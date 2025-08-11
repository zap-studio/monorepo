import { PluginError } from '@/lib/errors';
import {
  checkPluginDependencies,
  generateWrapperScripts,
  listAllPlugins,
  listAllScripts,
  listPluginScripts,
  runPluginScript,
  validatePluginSystem,
} from '@/utils/commands/plugin';

export async function pluginCommand(
  action: string,
  pluginName?: string,
  scriptName?: string,
  args: string[] = []
) {
  const projectDir = process.cwd();

  switch (action) {
    case 'run':
      if (!(pluginName && scriptName)) {
        throw new PluginError(
          'Plugin name and script name are required for run command'
        );
      }
      await runPluginScript(
        projectDir,
        pluginName,
        scriptName,
        undefined,
        args
      );
      break;

    case 'list':
      if (pluginName) {
        await listPluginScripts(projectDir, pluginName);
      } else {
        await listAllPlugins(projectDir);
      }
      break;

    case 'scripts':
      await listAllScripts(projectDir);
      break;

    case 'validate':
      await validatePluginSystem(projectDir);
      break;

    case 'deps':
      await checkPluginDependencies(projectDir);
      break;

    case 'generate':
      await generateWrapperScripts(projectDir);
      break;

    default:
      throw new PluginError(`Unknown plugin action: ${action}`);
  }
}
