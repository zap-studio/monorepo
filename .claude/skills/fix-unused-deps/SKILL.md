---
name: fix-unused-deps
description: Use when fallow or tsdown reports an unused dependency that is actually used, before adding it to .fallowrc.json's ignoreDependencies or tsdown's unused.ignore.
---

# Fix unused deps

## Adding a new dependency

Add it to the shared catalog in `pnpm-workspace.yaml` first, then reference `"catalog:"` in the package's `package.json`. `pnpm run fallow` fails on unused dependencies and unused exports — real false positives go in `.fallowrc.json`, not in a disabled check.

## Checking an unused-dependency finding

`pnpm run fallow` and tsdown's unused-dependency check both scan for static `import` statements. They do not run the code, so they miss real usage that only happens at runtime. Before you suppress a finding, check it first:

```
pnpm exec fallow dead-code --trace-dependency "<package-name>"
```

If it says `UNUSED (0 import(s))` but you know the package is used, find out how. That tells you which case below applies, and where to put the fix.

## Common causes

1. **Leaf package with no internal consumer.** A published package that nothing in the workspace imports, because it is meant for external npm/JSR users. A mention inside docs prose (`.mdx` samples) does not count as real use.
2. **Loaded by a runtime string, not a static `import`.** For example `import.meta.resolve(specifier)`, where `specifier` is built from a package name at runtime. A static scanner cannot follow this.
3. **Loaded by a build tool through a config key.** A tool config (for example a `tsdown.config.ts` option) makes an underlying tool load a package by name, or a CLI calls a companion binary. Same cause as case 2, just triggered by a tool instead of our own code.
4. **Real import, but the file is outside the scanned glob.** Some source folders are left out of lint/build globs on purpose (see `AGENTS.md` Gotchas). The scanner never sees the file that proves the import.
5. **Automatic JSX runtime hides the import.** With `"jsx": "react-jsx"`, no file writes `import ... from "react"` by hand — the compiler adds it. A per-package check can still fail even if `react` is used elsewhere in the repo.

Check `.fallowrc.json` (`ignoreDependencies`, `ignorePatterns`) and each package's `tsdown.config.ts` (`unused.ignore`) for entries that already exist. They show which case applied before, but confirm it still holds — do not assume.

## Adding a new suppression

1. Run `fallow dead-code --trace-dependency "<name>"` first. Never suppress on a guess.
2. If it shows 0 imports, run `grep -rn "<name>"` on the repo to find out why: a runtime string (case 2/3), a file outside the glob (case 4), or a genuine leaf package (case 1/5).
3. Add the entry to `.fallowrc.json`'s `ignoreDependencies`, or to the package's own `tsdown.config.ts` `unused.ignore` for a build-only false positive. Never add a disable comment or change the source just to silence the check — see `AGENTS.md` Gotchas: real false positives go in config, not in a disabled check.
