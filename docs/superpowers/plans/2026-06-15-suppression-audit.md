# Suppression Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit every lint, format, TypeScript, IDE, and coverage suppression comment, then remove each suppression that is no longer needed.

**Architecture:** Treat this as a small safety audit, not a refactor. Work by category: generated files first, production source second, tests third, benchmarks last. For each suppression, remove only when `pnpm run check` and the relevant targeted test/build command still pass or the replacement code is obviously equivalent. Run Fallow and React Doctor as additional verification, but queue conflicts between tools for the final task because lint, static analysis, and React-specific rules can require contradictory shapes.

**Tech Stack:** TypeScript, pnpm, Ultracite, oxlint, oxfmt, Vitest, TanStack Router.

---

## Current Inventory

Run:

```bash
rg -n "(@ts-\s*(ignore|expect-error|nocheck|check))|(eslint\s*-\s*(disable|enable|disable-line|disable-next-line))|(oxlint\s*-\s*(disable|enable|disable-line|disable-next-line))|(biome-ignore(-all|-start|-end)?)|(prettier-ignore)|(oxfmt-ignore)|(rome-ignore)|(deno-lint-ignore(-file)?)|(stylelint-disable(-line|-next-line)?)|(cspell:(disable|enable|ignore|words))|(istanbul ignore)|(v8 ignore)|(node:coverage disable)|(coverage ignore)|(spellchecker:disable)|(noinspection)"
```

Expected current total: 48 matches across 39 files.

Extra match beyond the original draft: `apps/docs/src/routeTree.gen.ts:5` has `// noinspection JSUnusedGlobalSymbols`.

## Files

- Audit generated file: `apps/docs/src/routeTree.gen.ts`
- Audit docs routes: `apps/docs/src/routes/docs/$.tsx`, `apps/docs/src/routes/og/docs/$.tsx`, `apps/docs/src/routes/llms[.]mdx.docs.$.ts`, `apps/docs/src/routes/packages/fetch.tsx`, `apps/docs/src/routes/packages/permit.tsx`, `apps/docs/src/routes/packages/retry.tsx`, `apps/docs/src/routes/packages/validation.tsx`, `apps/docs/src/routes/packages/webhooks.tsx`
- Audit package source: `packages/fetch/src/index.ts`, `packages/fetch/src/internal.ts`, `packages/fetch/src/url.ts`, `packages/permit/src/index.ts`, `packages/retry/src/abort.ts`, `packages/retry/src/errors.ts`, `packages/retry/src/index.ts`, `packages/retry/src/result-mode.ts`, `packages/retry/src/sleep.ts`, `packages/retry/src/throw-mode.ts`, `packages/validation/src/index.ts`, `packages/webhooks/src/adapters/base.ts`, `packages/webhooks/src/index.ts`, `packages/webhooks/src/utils/index.ts`, `packages/webhooks/src/verify.ts`
- Audit tests: `packages/fetch/tests/arktype.node.test.ts`, `packages/fetch/tests/index.node.test.ts`, `packages/fetch/tests/internal.node.test.ts`, `packages/fetch/tests/runtime.browser.test.ts`, `packages/fetch/tests/types.node.test.ts`, `packages/fetch/tests/valibot.node.test.ts`, `packages/fetch/tests/validator.node.test.ts`, `packages/fetch/tests/zod.node.test.ts`, `packages/permit/tests/helpers.node.test.ts`, `packages/permit/tests/index.node.test.ts`, `packages/retry/tests/result-mode.node.test.ts`, `packages/retry/tests/sequence-policy.ts`, `packages/retry/tests/throw-mode.node.test.ts`, `packages/validation/tests/index.node.test.ts`
- Audit benchmark: `packages/fetch/benchmarks/ecosystem/create-client-set.ts`
- Track tool conflicts in this plan under `## Tool Conflict Queue`

## Verification Commands

Use these commands at each major checkpoint:

```bash
pnpm run check
fallow --summary
react-doctor --verbose --scope full
```

Use these commands at final verification:

```bash
pnpm run check
pnpm run test
pnpm run build
fallow --summary
react-doctor --verbose --scope full
```

If tools disagree, do not churn the audited files immediately. Record the contradiction in `## Tool Conflict Queue` with the file, exact tool output, and likely tradeoff. Resolve those conflicts in Task 6 after suppression removals are stable.

## Tool Conflict Queue

Record conflicts here during execution:

```text
No conflicts recorded yet.
```

### Task 1: Lock Inventory

**Files:**

- Modify: none
- Test: none

- [ ] **Step 1: Re-run exhaustive search**

Run:

```bash
rg -n "(@ts-\s*(ignore|expect-error|nocheck|check))|(eslint\s*-\s*(disable|enable|disable-line|disable-next-line))|(oxlint\s*-\s*(disable|enable|disable-line|disable-next-line))|(biome-ignore(-all|-start|-end)?)|(prettier-ignore)|(oxfmt-ignore)|(rome-ignore)|(deno-lint-ignore(-file)?)|(stylelint-disable(-line|-next-line)?)|(cspell:(disable|enable|ignore|words))|(istanbul ignore)|(v8 ignore)|(node:coverage disable)|(coverage ignore)|(spellchecker:disable)|(noinspection)"
```

Expected: same 48 matches unless files changed since this plan.

- [ ] **Step 2: Commit checkpoint**

Run:

```bash
git status --short
git add docs/superpowers/plans/2026-06-15-suppression-audit.md
git commit -m "docs: plan suppression audit"
```

Expected: commit succeeds with only this plan staged.

### Task 2: Decide Generated File Policy

**Files:**

- Inspect: `apps/docs/src/routeTree.gen.ts`
- Modify: `oxlint.config.ts` only if generated route tree is not already ignored by Ultracite defaults
- Test: none

- [ ] **Step 1: Confirm generator ownership**

Run:

```bash
sed -n '1,12p' apps/docs/src/routeTree.gen.ts
```

Expected: file says it is automatically generated and should not be edited.

- [ ] **Step 2: Check whether generated file is linted**

Run:

```bash
pnpm exec oxlint apps/docs/src/routeTree.gen.ts
```

Expected: either no diagnostics or diagnostics that justify config-level ignore.

- [ ] **Step 3: If needed, ignore generated route tree in lint config**

Only if Step 2 reports diagnostics from `apps/docs/src/routeTree.gen.ts`, edit `oxlint.config.ts`:

```ts
export default defineConfig({
  extends: [core, react, tanstack, vitest],
  ignorePatterns: [...core.ignorePatterns, "apps/docs/src/routeTree.gen.ts"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm run check
fallow --summary
react-doctor --verbose --scope full
```

Expected: PASS, or conflict recorded in `## Tool Conflict Queue`.

- [ ] **Step 5: Commit**

Run:

```bash
git add oxlint.config.ts
git commit -m "chore: ignore generated route tree"
```

Expected: commit only if `oxlint.config.ts` changed. If no change, skip commit.

### Task 3: Audit Production Source Suppressions

**Files:**

- Modify: `packages/fetch/src/index.ts`, `packages/fetch/src/internal.ts`, `packages/fetch/src/url.ts`, `packages/permit/src/index.ts`, `packages/retry/src/abort.ts`, `packages/retry/src/errors.ts`, `packages/retry/src/index.ts`, `packages/retry/src/result-mode.ts`, `packages/retry/src/sleep.ts`, `packages/retry/src/throw-mode.ts`, `packages/validation/src/index.ts`, `packages/webhooks/src/adapters/base.ts`, `packages/webhooks/src/index.ts`, `packages/webhooks/src/utils/index.ts`, `packages/webhooks/src/verify.ts`
- Test: package unit tests and repo check

- [ ] **Step 1: Try deletion-only pass**

For each production-source suppression, delete the comment, then run:

```bash
pnpm run check
```

Expected: FAIL when suppression is still required; PASS when removable.

- [ ] **Step 2: Restore required suppressions with reason**

For each failed deletion, restore the existing suppression and keep its reason comment. Current likely-keep categories:

```text
no-await-in-loop: retry, permit, and webhook sequencing is intentional.
typescript/no-unsafe-type-assertion: generic runtime boundaries cannot fully prove caller-declared types.
func-style/no-use-before-define: public overloads and top-down readable APIs need function declarations.
promise/avoid-new: timer, abort, and callback APIs require promise adapters.
no-bitwise: constant-time XOR comparison needs bitwise operation.
max-classes-per-file: public error classes are intentionally colocated.
```

- [ ] **Step 3: Refactor only cheap false positives**

Use minimal equivalent edits only when they remove a suppression without changing public API. Example allowed change for `class-methods-use-this`:

```ts
protected shouldRetry(_error: Error, _attempt: number): boolean {
  return false;
}
```

If framework or subclass contract requires instance method, keep suppression.

- [ ] **Step 4: Verify production packages**

Run:

```bash
pnpm run check
pnpm run test
pnpm run build
fallow --summary
react-doctor --verbose --scope full
```

Expected: all PASS, or conflict recorded in `## Tool Conflict Queue`.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/fetch packages/permit packages/retry packages/validation packages/webhooks oxlint.config.ts
git commit -m "chore: audit source suppressions"
```

Expected: commit contains only source suppression removals, tiny equivalent refactors, or restored comments.

### Task 4: Audit Docs Route Suppressions

**Files:**

- Modify: `apps/docs/src/routes/docs/$.tsx`, `apps/docs/src/routes/og/docs/$.tsx`, `apps/docs/src/routes/llms[.]mdx.docs.$.ts`, `apps/docs/src/routes/packages/fetch.tsx`, `apps/docs/src/routes/packages/permit.tsx`, `apps/docs/src/routes/packages/retry.tsx`, `apps/docs/src/routes/packages/validation.tsx`, `apps/docs/src/routes/packages/webhooks.tsx`
- Test: docs check/build

- [ ] **Step 1: Try deletion-only pass**

Delete each route suppression one at a time and run:

```bash
pnpm run check
```

Expected: thrown `notFound` and `redirect` suppressions likely still fail because TanStack Router uses thrown control-flow sentinels.

- [ ] **Step 2: Keep TanStack Router control-flow suppressions if still needed**

Restore comments matching:

```text
typescript/only-throw-error
only-throw-error
sort-keys
no-use-before-define
func-style
oxfmt-ignore
```

Only keep them when deleting causes `pnpm run check` failure.

- [ ] **Step 3: Verify docs package**

Run:

```bash
pnpm --filter docs run build
pnpm run check
fallow --summary
react-doctor --verbose --scope full
```

Expected: all PASS, or conflict recorded in `## Tool Conflict Queue`.

- [ ] **Step 4: Commit**

Run:

```bash
git add apps/docs/src/routes
git commit -m "chore: audit docs route suppressions"
```

Expected: commit only if docs route files changed.

### Task 5: Audit Test and Benchmark Suppressions

**Files:**

- Modify: `packages/fetch/tests/arktype.node.test.ts`, `packages/fetch/tests/index.node.test.ts`, `packages/fetch/tests/internal.node.test.ts`, `packages/fetch/tests/runtime.browser.test.ts`, `packages/fetch/tests/types.node.test.ts`, `packages/fetch/tests/valibot.node.test.ts`, `packages/fetch/tests/validator.node.test.ts`, `packages/fetch/tests/zod.node.test.ts`, `packages/permit/tests/helpers.node.test.ts`, `packages/permit/tests/index.node.test.ts`, `packages/retry/tests/result-mode.node.test.ts`, `packages/retry/tests/sequence-policy.ts`, `packages/retry/tests/throw-mode.node.test.ts`, `packages/validation/tests/index.node.test.ts`, `packages/fetch/benchmarks/ecosystem/create-client-set.ts`
- Test: package tests and repo check

- [ ] **Step 1: Remove redundant test suppressions covered by config**

`oxlint.config.ts` already disables many rules in test files. Try deleting test-file suppressions for:

```text
func-style
no-await-in-loop
typescript/no-unsafe-argument
typescript/no-unsafe-assignment
typescript/no-unsafe-member-access
typescript/no-unsafe-type-assertion
typescript/only-throw-error
typescript/promise-function-async
typescript/strict-void-return
typescript/unbound-method
unicorn/consistent-function-scoping
vitest/max-expects
```

Run:

```bash
pnpm run check
```

Expected: PASS for suppressions already covered by test overrides; FAIL for suppressions outside override coverage, such as `require-await` or `promise/avoid-new`.

- [ ] **Step 2: Preserve compile-error assertions**

Keep `@ts-expect-error` comments in:

```text
packages/permit/tests/helpers.node.test.ts:119
packages/fetch/tests/internal.node.test.ts:191
packages/fetch/tests/types.node.test.ts:15
```

These encode negative type tests. Remove only if replaced by a dedicated type-test assertion command.

- [ ] **Step 3: Audit benchmark suppression**

Try deleting `packages/fetch/benchmarks/ecosystem/create-client-set.ts:24` and run:

```bash
pnpm run check
```

Expected: likely FAIL due loose third-party client result types. Keep suppression unless a tiny local typed wrapper removes all listed rules.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm run check
pnpm run test
fallow --summary
react-doctor --verbose --scope full
```

Expected: all PASS, or conflict recorded in `## Tool Conflict Queue`.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/fetch/tests packages/permit/tests packages/retry/tests packages/validation/tests packages/fetch/benchmarks
git commit -m "chore: audit test suppressions"
```

Expected: commit only if test or benchmark files changed.

### Task 6: Final Suppression Report

**Files:**

- Modify: `docs/superpowers/plans/2026-06-15-suppression-audit.md` if recording final results or tool conflicts
- Test: full repo check

- [ ] **Step 1: Final inventory**

Run:

```bash
rg -n "(@ts-\s*(ignore|expect-error|nocheck|check))|(eslint\s*-\s*(disable|enable|disable-line|disable-next-line))|(oxlint\s*-\s*(disable|enable|disable-line|disable-next-line))|(biome-ignore(-all|-start|-end)?)|(prettier-ignore)|(oxfmt-ignore)|(rome-ignore)|(deno-lint-ignore(-file)?)|(stylelint-disable(-line|-next-line)?)|(cspell:(disable|enable|ignore|words))|(istanbul ignore)|(v8 ignore)|(node:coverage disable)|(coverage ignore)|(spellchecker:disable)|(noinspection)"
```

Expected: count is lower than 48 or each remaining suppression has a clear reason.

- [ ] **Step 2: Full verification**

Run:

```bash
pnpm run check
pnpm run test
pnpm run build
fallow --summary
react-doctor --verbose --scope full
```

Expected: all PASS.

- [ ] **Step 3: Resolve queued tool conflicts**

For every entry in `## Tool Conflict Queue`, choose the narrowest fix that satisfies all tools. If no single code shape satisfies all tools, prefer this order:

```text
1. Runtime correctness and public API compatibility.
2. TypeScript correctness.
3. pnpm run check / Ultracite / oxlint.
4. react-doctor --verbose --scope full.
5. fallow --summary.
```

When keeping a suppression because tools disagree, keep or add a reason comment that names the contradiction. Example:

```ts
// oxlint-disable-next-line no-use-before-define -- Route object order is required by TanStack Router inference; React Doctor also expects loader before head.
```

Run after each conflict fix:

```bash
pnpm run check
fallow --summary
react-doctor --verbose --scope full
```

Expected: all PASS, or remaining conflict has an explicit reason comment and is listed in final notes.

- [ ] **Step 4: Commit final report if documented**

If a short audit note is added to this plan, commit it:

```bash
git add docs/superpowers/plans/2026-06-15-suppression-audit.md
git commit -m "docs: record suppression audit results"
```

Expected: commit only if the plan gained result notes.

## Self-Review

- Spec coverage: plan finds all suppression comments, includes broader regex than draft, checks whether each should stay or go, runs `fallow --summary`, runs `react-doctor --verbose --scope full`, and defers contradictory tool requirements to the final conflict-resolution task.
- Placeholder scan: no `TBD`, `TODO`, or deferred implementation placeholders.
- Type consistency: commands use repo scripts from `package.json`; file paths match current search output.

## Final Results

Implemented commits:

```text
5058df29 docs: plan suppression audit
5c5a05dd chore: audit source suppressions
8a7ee603 chore: audit docs route suppressions
1117c1e7 chore: audit test suppressions
747359ac chore: remove redundant max-expects suppressions
```

Comparable inventory using `git grep` against the plan commit and `HEAD`:

```text
5058df29: 53 matching lines across 39 files
HEAD:     49 matching lines across 36 files
```

Suppressions removed or narrowed:

```text
packages/fetch/src/url.ts: removed no-negated-condition from combined oxlint suppression.
packages/webhooks/src/index.ts: removed class-methods-use-this by converting private stateless helpers to static methods.
apps/docs/src/routes/docs/$.tsx: removed oxfmt-ignore.
packages/validation/tests/index.node.test.ts: removed func-style and unicorn/consistent-function-scoping from combined oxlint suppression.
packages/fetch/tests/index.node.test.ts: removed vitest/max-expects suppression.
packages/fetch/tests/runtime.browser.test.ts: removed vitest/max-expects suppression.
packages/permit/tests/index.node.test.ts: removed vitest/max-expects from combined oxlint suppression; kept require-await.
packages/retry/tests/throw-mode.node.test.ts: removed vitest/max-expects suppression.
```

Final verification:

```text
pnpm run check: PASS
pnpm run build: PASS
fallow --summary: PASS; reports no dead code and 0.9% duplication advisory.
react-doctor --verbose --scope full: PASS; reports no issues, with score API unreachable / not-installed notices.
pnpm run test: FAIL; 3 baseline test failures remain plus sandbox browser listen EPERM.
```

Known test failures left unchanged because they are outside the suppression audit:

```text
packages/fetch/tests/url.node.test.ts: query param order expectation mismatch.
packages/webhooks/tests/index.node.test.ts: default ack response expects headers: undefined but implementation omits the key.
packages/webhooks/tests/verify.node.test.ts: missing Web Crypto path throws TypeError instead of VerificationError.
Vitest browser runner in sandbox: listen EPERM on ::1.
```

Tool conflicts:

```text
No actionable tool conflicts recorded. Fallow and React Doctor notices were non-failing environment/tooling notices, not code-shape contradictions.
```
