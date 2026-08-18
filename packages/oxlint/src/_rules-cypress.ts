import type { RuleMap } from "./_prefixed.ts";

export const cypressRules = {
  "no-assigning-return-values": "error",
  // async/await masks Cypress's command-queue semantics same as `no-async-tests`
  // (upstream's own `recommended` config omits this despite its `docs.recommended: true`
  // flag — same bug class, so treated the same here)
  "no-async-before": "error",
  "no-async-tests": "error",
  // leftover debugger statement, same severity class as core `no-debugger`
  "no-debug": "error",
  // hangs headless/CI runs waiting for user interaction if left in
  "no-pause": "error",
  "no-unnecessary-waiting": "error",
  "unsafe-to-chain-command": "error",

  // race condition between screenshot and assertion timing, not always wrong
  "assertion-before-screenshot": "warn",
  // stylistic alias of `.should()`, autofixable, no correctness difference
  "no-and": "warn",
  "no-chained-get": "warn",
  // sometimes legitimate for covered/animated elements; flag, don't block
  "no-force": "warn",

  // targets cy.xpath(), a command removed from core Cypress; deprecated upstream
  "no-xpath": "off",
  // opinionated selector-strategy convention needing a data-* attribute
  // convention and visibility into real test files this repo doesn't have
  "require-data-selectors": "off",
} satisfies RuleMap;
