# AGENTS.md

Zap Studio monorepo: type-safe, framework-agnostic, composable, tree-shakeable TypeScript libraries published to npm and JSR.

## Layout

- `packages/*` — the published libraries (`fetch`, `react-hooks`, `monads`, etc. — see the root `README.md` for the current list).
- `apps/docs` — the [zapstudio.dev](https://www.zapstudio.dev) docs site (Vocs, deployed to Cloudflare via Wrangler).
- `configs/*` — private shared configs: tsconfig bases (`@zap-studio/typescript`) and the shared `tsdown` build config.

## Commands

Root `package.json` `scripts` is the source of truth. The main ones:

| Command                                | What it does                                                                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run publish:check`               | The full gate (format check, typecheck, lint, fallow, test, build). Run this before you call a change done. At minimum, run typecheck + lint + the affected tests, and report the real output. |
| `pnpm run lint:fix`, `pnpm run format` | oxlint (type-aware) and oxfmt.                                                                                                                                                                 |
| `pnpm run test`                        | Vitest. Browser tests need Chromium once: `pnpm exec playwright install --with-deps chromium`.                                                                                                 |
| `pnpm run fallow`                      | Finds unused dependencies and unused exports.                                                                                                                                                  |

## Code style

- TypeScript strict, plus the extra safety flags in `configs/typescript/base.json` (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, etc.).
- Relative imports carry the `.ts` extension (`./use-counter.ts`) — `allowImportingTsExtensions` is on, and JSR needs it.
- `import type` for type-only imports (`verbatimModuleSyntax`).
- Arrow-function consts for exported functions and hooks, kebab-case file names, `use-*.ts` for React hooks.
- TSDoc on every exported symbol. The package entry point carries a `@module` block. Write what the thing does and the non-obvious constraint, not a restatement of the signature.

## Quality tools

Three tools gate `pnpm run publish:check`. Know what each one is for, so a failure tells you where to look:

| Tool                                     | What it is for                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **oxlint** (`pnpm run lint`, type-aware)  | The linter. It catches correctness bugs, unsafe patterns, and style problems. Rules come from `@zap-studio/oxlint` plus the plugins in `oxlint.config.ts`: a repo-local plugin (`packages/oxlint/src/anti-slop`, rules like `require-safety-comment-for-type-assertion`) and the `react-doctor` plugin (hooks rules, ref-in-render, effect patterns — most relevant to `packages/react-hooks`; findings show up as `react-doctor/<rule>`, disabled the same way as any other oxlint rule). |
| **fallow** (`pnpm run fallow`)            | Finds unused dependencies and unused exports. It fails if you add a dependency you don't import, or export something nothing uses.                                                                                                                                                                                                                                               |
| **v8**                                    | Not a linter. It is Vitest's coverage provider (see `coverage.provider` in the root Vitest config). It measures which lines your tests run. A `v8 ignore` comment tells it that a line cannot be reached in tests on purpose, so coverage does not fail on it.                                                                                                                  |

For working through an oxlint finding, deciding whether a disable comment is the right call, or writing a SAFETY comment for an `as` cast, use the `review-linting` skill instead of guessing — it has the exact rule and format.

## Language

Write everything in simple English (around B1 level): code comments, TSDoc, docs pages, README files, changelog entries, commit messages, PR text, and chat replies.

- Use common words and short sentences. One idea per sentence.
- Prefer "start" over "commence", "fix" over "remediate", "let" over "facilitate".
- Avoid idioms and rare phrasal verbs.
- Keep technical terms, API names, code, and error strings exactly as they are. Do not simplify those.

This also applies to lint-disable reasons and any other inline note.

## Tests

Vitest runs two projects, picked purely by file name:

- `*.node.test.ts` — Node environment. For React hooks, this is the SSR check (`renderToString`).
- `*.browser.test.ts` — real Chromium via Playwright. Use `@testing-library/react` (`renderHook`, `act`) for hooks, and real DOM/Web APIs.

Put tests next to the source file. `globals: true` and `restoreMocks: true` are set. Any behavior change needs a test in the matching project. A React hook usually needs both files.

## Commits and PRs

Conventional Commits, lowercase, imperative, short subject: `feat: add useBrowserEngine hook`, `fix: rework cookie types`. Branch off `main`; never commit straight to `main`. PRs state what changed, why, how it was checked, and whether it is breaking. Keep changes focused — no unrelated refactors. See `.github/CONTRIBUTING.md`.

**Never add an agent as co-author.** No `Co-Authored-By: Claude` (or any other tool or bot) line, and no "Generated with …" footer in commit messages, PR bodies, or release notes.

## Gotchas

- `coverage/` and `dist/` are build output — never edit them or commit fixes into them.
- To add a dependency, add it to the catalog in `pnpm-workspace.yaml` first, then reference `"catalog:"`.
- `pnpm run fallow` fails on unused deps and exports. Genuine false positives go in `.fallowrc.json`, not into a disabled check.
- A few paths are left out of lint/build globs on purpose (see `oxlint.config.ts`, `.fallowrc.json`, the tsdown config). Check those before you assume a file is unlinted by accident.

## Skills

These live in `.claude/skills/` and load on demand — read the pointed-to `SKILL.md` instead of re-deriving the workflow. Skill names always start with a verb (`bump-and-changelog`).

| Skill                | Use when                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `review-linting`     | An oxlint finding needs a fix or a disable comment, or a runtime `as` cast needs a SAFETY comment.                              |
| `bump-and-changelog` | Deciding a SemVer level, bumping a package's version (and its workspace dependents), and writing the changelog entry.           |
| `release`            | Working out release order, tagging, and creating GitHub releases for packages that already have a bumped version and changelog. |
| `scaffold-package`   | Adding a new package, a new dependency, or a new/removed export.                                                                |
| `sync-docs`          | A user-facing API or behavior change needs matching docs pages, sidebar entry, or README updates.                               |
| `fix-unused-deps`    | fallow or tsdown reports an unused dependency that is actually used, before adding it to an ignore list.                        |

## This document can go stale

Everything above, especially the scripts, tool names, config paths, and disable-comment syntax mentioned in [Quality tools](#quality-tools), describes the repo as it is today. The same is true of the skills in `.claude/skills/` — they describe specific commands, file paths, and formats that can drift just as easily as this file. Dependencies get upgraded, tools get replaced, and APIs change. Treat any instruction here, or in a skill, as possibly outdated when the codebase disagrees with it.

If a command in this file or a skill fails, or a rule/flag/comment syntax it names seems gone:

1. Do not route around it by guessing a new syntax or quietly patching the config to make the error go away.
2. Check the installed version of the tool (`package.json` catalog entry, `pnpm ls <tool>`), then read that version's own docs. Confirm whether the command, flag, or comment syntax this file (or the skill) describes still matches that version.
3. If it does not match, stop and escalate to the human. Say what this file (or skill) claims, what the tool's current docs/version actually say, and propose a fix (updated command, config, or wording). Let the human decide and apply it. Do not rewrite AGENTS.md, a skill, or the config yourself to match your own guess.

This applies to any fact in this file or in a skill that depends on outside state — tool APIs, dependency versions, script names — not only quality tools. That section is just the most likely place to go stale first.
