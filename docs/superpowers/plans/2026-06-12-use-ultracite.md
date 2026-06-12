# Use Ultracite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hand-maintained `.oxfmtrc.json` and `.oxlintrc.json` with ultracite's preset config, preserving type-aware linting, type-check, lefthook pre-commit hooks, and the custom `sortTailwindcss` oxfmt setting.

**Architecture:** Run `pnpx ultracite@latest init` with flags to scaffold `oxlint.config.ts` and `oxfmt.config.ts` that extend ultracite presets; post-init patch oxfmt config to restore custom Tailwind sort; update lefthook and package.json scripts to go through `pnpx ultracite fix/check`; delete the legacy JSON configs.

**Tech Stack:** ultracite ^7.8.3, oxlint ^1.67.0 (unchanged), oxfmt ^0.52.0 (unchanged), lefthook ^2.1.8 (unchanged), pnpm

---

## Files Changed

| Action | Path                  | Purpose                                                                 |
| ------ | --------------------- | ----------------------------------------------------------------------- |
| Delete | `.oxfmtrc.json`       | Replaced by `oxfmt.config.ts`                                           |
| Delete | `.oxlintrc.json`      | Replaced by `oxlint.config.ts`                                          |
| Create | `oxlint.config.ts`    | Extends ultracite preset with type-aware + ignorePatterns               |
| Create | `oxfmt.config.ts`     | Extends ultracite defaults + sortTailwindcss preserved                  |
| Modify | `lefthook.yml`        | Replace explicit oxfmt/oxlint invocations with `pnpx ultracite fix`     |
| Modify | `package.json`        | Add `ultracite` devDep; update format/lint scripts                      |
| Modify | `pnpm-workspace.yaml` | Add `ultracite: ^7.8.3` to catalog; remove `oxlint-tsgolint` if covered |

---

## Task 1: Add ultracite to the project catalog

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`

- [ ] **Step 1: Add to catalog**

Open `pnpm-workspace.yaml`. In the `catalog:` block, add after the `oxlint-tsgolint` entry:

```yaml
ultracite: ^7.8.3
```

- [ ] **Step 2: Add to root devDependencies**

In `package.json` `devDependencies`, add:

```json
"ultracite": "catalog:"
```

Do not remove `oxfmt`, `oxlint`, or `lefthook` — ultracite is a config layer on top of them, not a replacement.

- [ ] **Step 3: Install**

```bash
pnpm install
```

Expected: lock file updates, `node_modules/ultracite` present.

Verify:

```bash
ls node_modules/ultracite
```

Expected: directory exists (no "No such file" error).

- [ ] **Step 4: Commit**

```bash
git add pnpm-workspace.yaml package.json pnpm-lock.yaml
git commit -m "chore: add ultracite to catalog"
```

---

## Task 2: Run ultracite init to scaffold config files

**Files:**

- Create: `oxlint.config.ts`
- Create: `oxfmt.config.ts`
- Modify: `lefthook.yml` (will be overwritten — restore custom settings in Task 4)

- [ ] **Step 1: Run init non-interactively**

```bash
pnpx ultracite@latest init \
  --pm pnpm \
  --linter oxlint \
  --type-aware \
  --integrations lefthook \
  --skip-install \
  --quiet
```

Expected output: messages like "Created oxlint.config.ts", "Created oxfmt.config.ts", "Updated lefthook.yml". No interactive prompts.

> If the command prompts despite `--quiet`, answer: linter=oxlint, type-aware=yes, integrations=lefthook, skip all others.

- [ ] **Step 2: Confirm generated files exist**

```bash
ls oxlint.config.ts oxfmt.config.ts
```

Expected: both files present.

- [ ] **Step 3: Inspect generated oxlint.config.ts**

Read the file. Confirm:

- It imports or extends a preset from `ultracite/oxlint/...`
- `typeAware: true` is set (either directly or via the `--type-aware` flag embedding)
- `typeCheck: true` is set

If `typeCheck: true` is missing, add it to the options object alongside `typeAware: true`.

- [ ] **Step 4: Inspect generated oxfmt.config.ts**

Read the file. Note the export shape — you will need to add `sortTailwindcss` in Task 3.

- [ ] **Step 5: Commit scaffold**

```bash
git add oxlint.config.ts oxfmt.config.ts lefthook.yml
git commit -m "chore: scaffold ultracite config via init"
```

---

## Task 3: Restore custom oxfmt settings

**Files:**

- Modify: `oxfmt.config.ts`

The old `.oxfmtrc.json` had:

```json
{
  "sortImports": {},
  "sortPackageJson": true,
  "sortTailwindcss": {
    "stylesheet": "apps/docs/src/styles/app.css",
    "functions": ["cn"]
  },
  "ignorePatterns": ["**/dist/**", "**/node_modules/**", "**/routeTree.gen.ts"]
}
```

Ultracite's generated `oxfmt.config.ts` will include `sortImports` and `ignorePatterns` from the preset. You need to add back `sortPackageJson` and `sortTailwindcss`.

- [ ] **Step 1: Read the generated oxfmt.config.ts**

Note the exact export format — it may use `export default { ...core, ... }` or `defineConfig(...)`.

- [ ] **Step 2: Add missing custom options**

Merge in the Tailwind-specific settings. The resulting file should include these fields regardless of the surrounding syntax:

```ts
sortPackageJson: true,
sortTailwindcss: {
  stylesheet: "apps/docs/src/styles/app.css",
  functions: ["cn"],
},
```

Example — if the generated file looks like:

```ts
import { core } from "ultracite/oxfmt";

export default {
  ...core,
  sortImports: {},
  ignorePatterns: ["**/dist/**", "**/node_modules/**", "**/routeTree.gen.ts"],
};
```

Edit it to:

```ts
import { core } from "ultracite/oxfmt";

export default {
  ...core,
  sortImports: {},
  sortPackageJson: true,
  sortTailwindcss: {
    stylesheet: "apps/docs/src/styles/app.css",
    functions: ["cn"],
  },
  ignorePatterns: ["**/dist/**", "**/node_modules/**", "**/routeTree.gen.ts"],
};
```

> If `ignorePatterns` already comes from the preset spread (`...core`), don't add it twice — check if removing the explicit `ignorePatterns` entry still suppresses `dist/` and `routeTree.gen.ts`. If not, keep it.

- [ ] **Step 3: Verify oxfmt runs without error**

```bash
pnpm exec oxfmt --check .
```

Expected: exit 0 or formatting suggestions only (no "unknown option" errors).

- [ ] **Step 4: Commit**

```bash
git add oxfmt.config.ts
git commit -m "chore: restore sortTailwindcss in oxfmt config"
```

---

## Task 4: Fix lefthook.yml

**Files:**

- Modify: `lefthook.yml`

The init command will have replaced lefthook.yml with something like:

```yaml
pre-commit:
  jobs:
    - run: npx ultracite fix
      stage_fixed: true
```

We need to:

1. Switch `npx` → `pnpx` (consistent with the rest of the monorepo)
2. Re-add `parallel: true` so format and lint don't serialize unnecessarily

However, since `pnpx ultracite fix` runs both format and lint in a single call, the two-job parallel setup is no longer needed. The simpler single-job config is correct.

- [ ] **Step 1: Read the generated lefthook.yml**

Check its content.

- [ ] **Step 2: Replace with pnpm-compatible config**

Write `lefthook.yml` as:

```yaml
pre-commit:
  jobs:
    - name: fix
      run: pnpx ultracite fix {staged_files}
      glob: "*"
      stage_fixed: true
```

> `{staged_files}` passes only the staged files to ultracite fix — same pattern as the old per-tool hooks.

- [ ] **Step 3: Reinstall lefthook hooks**

```bash
pnpm exec lefthook install
```

Expected: "✅ Lefthook installed" or similar.

- [ ] **Step 4: Commit**

```bash
git add lefthook.yml
git commit -m "chore: update lefthook to use ultracite fix"
```

---

## Task 5: Update package.json scripts

**Files:**

- Modify: `package.json`

Current scripts that reference oxfmt/oxlint directly:

```json
"format": "oxfmt .",
"format:check": "oxfmt --check .",
"lint": "oxlint --type-aware --type-check .",
"lint:fix": "oxlint --type-aware --type-check --fix .",
```

Replace with ultracite equivalents:

```json
"format": "pnpx ultracite fix",
"format:check": "pnpx ultracite check",
"lint": "pnpx ultracite check",
"lint:fix": "pnpx ultracite fix",
```

> `ultracite check` runs both format check and lint. `ultracite fix` runs both format and lint fix. Keeping separate `format`/`lint` script names is fine — they're effectively aliases.

- [ ] **Step 1: Edit package.json scripts**

Apply the replacements above. The `publish:check` script calls `format:check` and `lint` indirectly — those will pick up the new commands automatically.

- [ ] **Step 2: Smoke-test scripts**

```bash
pnpm run format:check
```

Expected: exit 0 (or formatting issues flagged, not a command-not-found error).

```bash
pnpm run lint
```

Expected: exit 0 or lint warnings/errors from your code (not a config error).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: update scripts to use ultracite"
```

---

## Task 6: Delete legacy config files

**Files:**

- Delete: `.oxfmtrc.json`
- Delete: `.oxlintrc.json`

- [ ] **Step 1: Run ultracite doctor first**

```bash
pnpx ultracite doctor
```

Expected: all checks pass. If it reports conflicting configs (`.oxfmtrc.json`, `.oxlintrc.json`), that confirms deletion is correct.

- [ ] **Step 2: Delete legacy files**

```bash
rm .oxfmtrc.json .oxlintrc.json
```

- [ ] **Step 3: Re-run doctor**

```bash
pnpx ultracite doctor
```

Expected: no "conflicting config" warnings.

- [ ] **Step 4: Run full check to confirm nothing broke**

```bash
pnpm run lint
pnpm run format:check
```

Expected: both exit without config errors.

- [ ] **Step 5: Commit**

```bash
git add -u .oxfmtrc.json .oxlintrc.json
git commit -m "chore: remove legacy oxfmt and oxlint json configs"
```

---

## Task 7: Clean up oxlint-tsgolint (if covered by ultracite)

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`

Ultracite's oxlint preset includes built-in support equivalent to the typescript eslint plugin. `oxlint-tsgolint` provides TypeScript-specific lint rules on top of oxlint. Check if ultracite already covers these rules before removing it.

- [ ] **Step 1: Check what oxlint-tsgolint provides**

```bash
cat node_modules/oxlint-tsgolint/README.md 2>/dev/null | head -40
```

Look for the rule list it enables.

- [ ] **Step 2: Check if ultracite's oxlint preset enables the same rules**

```bash
cat node_modules/ultracite/oxlint/core* 2>/dev/null || find node_modules/ultracite -name "*.ts" | head -10
```

If ultracite's core preset already enables all the same TS rules, `oxlint-tsgolint` is redundant and can be removed. If it adds unique rules you want to keep, leave it in — it composes fine with ultracite.

- [ ] **Step 3: Remove if redundant**

Remove `oxlint-tsgolint: ^0.23.0` from `pnpm-workspace.yaml` catalog and `"oxlint-tsgolint": "catalog:"` from `package.json` devDependencies. Then:

```bash
pnpm install
pnpm run lint
```

Expected: lint still passes with no missing-plugin errors.

- [ ] **Step 4: Commit**

```bash
git add pnpm-workspace.yaml package.json pnpm-lock.yaml
git commit -m "chore: remove oxlint-tsgolint, covered by ultracite preset"
```

If you decided to keep it, skip this task and leave a note.

---

## Verification

After all tasks complete:

```bash
pnpx ultracite doctor   # should show all green
pnpm run lint           # should pass (or show code issues, not config errors)
pnpm run format:check   # should pass
pnpm run test           # should be unaffected
```

Make a small edit to a staged file and run `git commit` to verify the lefthook pre-commit hook fires and calls `ultracite fix` correctly.
