import type { RuleMap } from "./_prefixed.ts";

export const playwrightRules = {
  "consistent-spacing-between-blocks": "warn",
  "expect-expect": "warn",
  "max-nested-describe": "warn",
  "missing-playwright-await": "error",
  "no-commented-out-tests": "error",
  "no-conditional-expect": "warn",
  "no-conditional-in-test": "warn",
  "no-duplicate-hooks": "warn",
  "no-duplicate-slow": "warn",
  "no-element-handle": "warn",
  "no-eval": "warn",
  "no-focused-test": "error",
  "no-force-option": "warn",
  "no-nested-step": "warn",
  "no-networkidle": "error",
  "no-nth-methods": "error",
  "no-page-pause": "warn",
  "no-skipped-test": "warn",
  "no-slowed-test": "error",
  "no-standalone-expect": "error",
  "no-unnecessary-assertions": "error",
  "no-unsafe-references": "error",
  "no-unused-locators": "error",
  "no-useless-await": "warn",
  "no-useless-not": "warn",
  "no-wait-for-navigation": "error",
  "no-wait-for-selector": "warn",
  "no-wait-for-timeout": "warn",
  "prefer-comparison-matcher": "error",
  "prefer-equality-matcher": "error",
  "prefer-hooks-in-order": "warn",
  "prefer-hooks-on-top": "warn",
  "prefer-locator": "warn",
  "prefer-native-locators": "error",
  "prefer-strict-equal": "error",
  "prefer-to-be": "error",
  "prefer-to-contain": "error",
  "prefer-to-have-count": "warn",
  "prefer-to-have-length": "warn",
  "prefer-web-first-assertions": "error",
  "require-to-pass-timeout": "error",
  "require-to-throw-message": "error",
  "require-top-level-describe": "error",
  "valid-describe-callback": "error",
  "valid-expect": "error",
  "valid-expect-in-promise": "error",
  "valid-test-tags": "error",
  "valid-title": "error",

  // needs a project-specific numeric threshold this shared preset can't hardcode
  "max-expects": "off",
  // locator-strategy opinion, not correctness; getByTitle is legitimate for
  // icon-only elements lacking aria-label
  "no-get-by-title": "off",
  // blanket-disallows all hooks without options to scope it down; too disruptive
  "no-hooks": "off",
  // locator-strategy opinion; disallows page.locator() entirely without an
  // allowlist, too aggressive without visibility into real test files
  "no-raw-locators": "off",
  // opt-in allowlist rules, no-op with nothing to restrict by default
  "no-restricted-locators": "off",
  "no-restricted-matchers": "off",
  "no-restricted-roles": "off",
  // subjective convention, conflicts with HTTP-verb/proper-noun titles (e.g. "GET /api/users")
  "prefer-lowercase-title": "off",
  // plausible, but no real Playwright test files here yet to confirm false-positive rate
  "require-hook": "off",
  // forces expect.soft everywhere, changes failure-accumulation semantics broadly
  "require-soft-assertions": "off",
  // needs a tagging convention/workflow this repo doesn't have
  "require-tags": "off",
} satisfies RuleMap;
