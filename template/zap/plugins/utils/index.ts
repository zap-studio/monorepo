import type { BaseZapPlugin } from "../types";

/* biome-ignore lint/suspicious/noExplicitAny: We use `any` here to allow the plugin system to accept arbitrary config, integrations, and providers types. This is necessary for supporting a flexible plugin architecture where each plugin can define its own shape. Restricting these generics would break compatibility with plugins that have custom types. */
type PluginMap<T extends readonly BaseZapPlugin<string, any, any, any>[]> = {
  [P in T[number] as P["id"]]: P;
};

export function zap<T extends readonly BaseZapPlugin[]>(
  plugins: T
): PluginMap<T> {
  return Object.fromEntries(
    plugins.map((plugin) => [plugin.id, plugin])
  ) as PluginMap<T>;
}
