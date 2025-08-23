export type PluginConfig = {
  name: string;
  description: string;
  author: string;
  dependencies: {
    packages: string[];
    devPackages: string[];
    folders?: string[];
    files?: string[];
    plugins: string[];
  };
  scripts: Record<string, string>;
};

export type PluginScriptOptions = {
  projectDir: string;
  pluginName: string;
  scriptName: string;
  args?: string[];
};

export type PluginListOptions = {
  projectDir: string;
  showScripts?: boolean;
  filterPluginName?: string;
};
