export type Severity = "error" | "warn" | "off";
export type RuleMap = Record<string, Severity>;

export const prefixed = (pluginName: string, rules: RuleMap): RuleMap =>
  Object.fromEntries(
    Object.entries(rules).map(([rule, severity]) => [`${pluginName}/${rule}`, severity]),
  );
