type Severity = "error" | "warn" | "off";
type RuleMap = Record<string, Severity>;

const prefixed = (pluginName: string, rules: RuleMap): RuleMap =>
  Object.fromEntries(
    Object.entries(rules).map(([rule, severity]) => [`${pluginName}/${rule}`, severity]),
  );

export { prefixed };
export type { Severity, RuleMap };
