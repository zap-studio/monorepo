export interface PluginConfig {
  name: string;
  description: string;
  author: string;
  required: {
    dependencies: string[];
    devDependencies: string[];
    folders?: string[];
    files?: string[];
    plugins: string[];
  };
  scripts: Record<string, string>;
}

export interface PluginScriptOptions {
  projectDir: string;
  pluginName: string;
  scriptName: string;
  args?: string[];
}

export interface PluginListOptions {
  projectDir: string;
  showScripts?: boolean;
  filterPluginName?: string;
}
