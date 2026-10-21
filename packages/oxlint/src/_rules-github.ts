import type { RuleMap } from "./_prefixed.ts";

export const githubRules: RuleMap = {
  "array-foreach": "error",
  "async-currenttarget": "error",
  "async-preventdefault": "error",
  "authenticity-token": "error",
  "js-class-name": "error",
  "no-blur": "error",
  "no-d-none": "error",
  "no-dynamic-script-tag": "error",
  "no-implicit-buggy-globals": "error",
  "no-inner-html": "error",
  "no-innerText": "error",
  "no-then": "error",
  "no-useless-passive": "error",
  "prefer-observers": "error",
  "require-passive-events": "error",
  "unescaped-html-literal": "error",

  // default regex enforces camelCase filenames; this repo is kebab-case, and our
  // rule-map shape here carries a severity string only, not rule options/regex
  "filenames-match-regex": "off",
  // pushes getAttribute('data-*') over .dataset for old-browser compat; every
  // runtime these packages target supports .dataset fine
  "no-dataset": "off",
  // matches on method name only (setAttribute/getAttribute), no type-awareness —
  // fires on OpenTelemetry Span.setAttribute() calls across _otel.ts files, whose
  // dotted keys (e.g. "http.response.status_code") are the correct OTel
  // convention, not a DOM-attribute bug
  "get-attribute": "off",
};
