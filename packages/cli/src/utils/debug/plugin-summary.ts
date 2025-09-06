import type { PluginId } from "@zap-ts/architecture/types";

export function formatSummary(
  steps: {
    step1: Array<{ plugin: PluginId; path: string; type: string }>;
    step2: Array<{ plugin: PluginId; path: string }>;
    step3: Array<{ plugin: PluginId; path: string }>;
    step4: Array<{
      corePlugin: PluginId;
      optionalPlugin: PluginId;
      path: string;
    }>;
  },
  corePluginSummary: Record<PluginId, PluginId[]>,
  optionalPluginSummary: Record<PluginId, PluginId[]>
): string {
  const { step1, step2, step3, step4 } = steps;
  const cwd = process.cwd();
  const lines: string[] = [];
  lines.push("\nStep 1 - Determine core plugins:");
  for (const { plugin, path: _path, type } of step1) {
    lines.push(`- '${plugin}' (${type}): ${_path.replace(`${cwd}/`, "")}`);
  }
  lines.push("\nStep 2 - Core plugin imports:");
  for (const { plugin, path: _path } of step2) {
    lines.push(`- '${plugin}' (core): ${_path.replace(`${cwd}/`, "")}`);
  }
  lines.push("\nStep 2 - Core plugin dependency summary:");
  for (const [core, deps] of Object.entries(corePluginSummary)) {
    if (Object.hasOwn(corePluginSummary, core)) {
      lines.push(`- '${core}' is depended on by: [${deps.join(", ")}]`);
    }
  }
  lines.push("\nStep 3 - Optional plugin imports:");
  for (const { plugin, path: _path } of step3) {
    lines.push(`- '${plugin}' (optional): ${_path.replace(`${cwd}/`, "")}`);
  }
  lines.push("\nStep 3 - Optional plugin dependency summary:");
  for (const opt in optionalPluginSummary) {
    if (Object.hasOwn(optionalPluginSummary, opt)) {
      lines.push(
        `- '${opt}' is depended on by: [${optionalPluginSummary[opt as PluginId].join(", ")}]`
      );
    }
  }
  lines.push("\nStep 4 - Warnings: Optional plugins imported by core plugins:");
  if (step4.length === 0) {
    lines.push("- None found.");
  } else {
    for (const { corePlugin, optionalPlugin, path: _path } of step4) {
      lines.push(
        `- Core plugin '${corePlugin}' imports optional plugin '${optionalPlugin}' in ${_path}`
      );
    }
  }
  return `${lines.join("\n")}\n`;
}
