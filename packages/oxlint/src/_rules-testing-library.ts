import type { RuleMap } from "./_prefixed.ts";

export const testingLibraryRules = {
  "await-async-events": "error",
  "await-async-queries": "error",
  "await-async-utils": "error",
  "no-await-sync-events": "error",
  "no-await-sync-queries": "error",
  "no-global-regexp-flag-in-query": "error",
  "no-node-access": "error",
  "no-promise-in-fire-event": "error",
  "no-wait-for-multiple-assertions": "error",
  "no-wait-for-side-effects": "error",
  "no-wait-for-snapshot": "error",
  "prefer-find-by": "error",
  "prefer-presence-queries": "error",
  "prefer-query-by-disappearance": "error",
  "prefer-screen-queries": "error",

  // upstream's own `dom` config sets this to warn, not error
  "no-debugging-utils": "warn",
  // userEvent simulates real interaction sequences fireEvent skips; not force-enabled
  // upstream, but a valuable nudge — not enabled in any upstream config
  "prefer-user-event": "warn",
  "prefer-user-event-setup": "warn",

  // needs a project-specific regex/allowlist to mean anything
  "consistent-data-testid": "off",
  // not part of the `dom` config: container access is idiomatic when using
  // DOM Testing Library directly, only discouraged by framework wrappers that push `screen`
  "no-container": "off",
  // targets projects importing `@testing-library/dom` from a framework package
  // (React/Vue/etc.); this preset already targets the `dom` package directly
  "no-dom-import": "off",
  // auto-cleanup is a framework-testing-package concept (React/Vue/Svelte's
  // afterEach auto-cleanup); not applicable to plain DOM Testing Library
  "no-manual-cleanup": "off",
  // render-lifecycle timing concern specific to framework component-testing
  // helpers; not applicable to plain DOM Testing Library
  "no-render-in-lifecycle": "off",
  // opt-in blanket ban on data-testid queries, too strict as a default
  "no-test-id-queries": "off",
  // `act()` is a React/Marko rendering concept, not applicable outside those renderers
  "no-unnecessary-act": "off",
  // opinionated assertion-style preference, inverse of prefer-implicit-assert below;
  // not enabled in any upstream config, pick one convention per project instead
  "prefer-explicit-assert": "off",
  "prefer-implicit-assert": "off",
  // no-op without a project-specific `validEntries` config
  "prefer-query-matchers": "off",
  // naming-convention enforcement for framework `render()` result destructuring;
  // not applicable outside framework wrappers
  "render-result-naming-convention": "off",
} satisfies RuleMap;
