import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorInkRules = {
  "ink-ctrl-c-handler-requires-exit-option": "error",
  "ink-no-bare-process-exit": "error",
  "ink-no-direct-raw-mode": "error",
  "ink-no-dom-host-elements": "error",
  "ink-no-dom-router": "error",
  "ink-no-focus-in-render": "error",
  "ink-no-layout-inside-text": "error",
  "ink-no-live-hooks-in-render-to-string": "error",
  "ink-no-measure-element-in-render": "error",
  "ink-no-multiple-static": "warn",
  "ink-no-raw-text": "error",
  "ink-no-repeated-render": "error",
  "ink-prefer-use-animation": "warn",
  "ink-prefer-use-paste": "warn",
  "ink-static-is-append-only": "warn",
  "ink-static-requires-key": "error",
  "ink-use-reactive-window-size": "warn",
  "ink-use-string-width-for-cursor": "warn",
  "ink-use-suspend-terminal": "error",
  "ink-valid-aria-semantics": "error",

  // retired upstream — always a no-op per the rule's own metadata
  "ink-newline-inside-text": "off",
  "ink-suspense-requires-concurrent": "off",
} satisfies RuleMap;
