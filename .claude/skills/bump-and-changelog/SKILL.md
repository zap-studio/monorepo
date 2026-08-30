---
name: bump-and-changelog
description: Use when deciding a SemVer level for a package change, bumping its version, or writing its CHANGELOG.md entry.
---

# Bump and changelog

## 1. Find what changed

Diff the package against `main`. Judge the change against its public API: the exports from files that are not `_*.ts` (see `scaffold-package` skill).

## 2. Classify with SemVer

| Level     | When                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **major** | Removed or renamed an export, changed a signature in a way that breaks callers, changed default behavior a user would notice as broken. |
| **minor** | Added a new export, added an optional parameter, added new backward-compatible behavior.                                                |
| **patch** | Bug fix, internal refactor, doc/comment-only change — no public API change.                                                             |

## 3. If it's unclear, ask

Some changes do not fit one bucket cleanly. Do not decide alone. State the change, your suggested level, and why — let the human confirm or correct it.

## 4. Bump the package

Update `version` in both `packages/<name>/package.json` and `packages/<name>/jsr.json` — they must always match.

## 5. Cascade the bump to dependents

Find every workspace package that depends on the one you just bumped:

```
grep -rl "\"@zap-studio/<name>\":" packages/*/package.json
```

Each hit needs its own bump too, since its shipped behavior changed with the upstream package. Decide the level the same way as steps 2–3, but ask: does this upstream change reach the dependent's own users? Usually **patch**. Use **minor** or **major** only if the upstream change removes something the dependent re-exports, or changes the dependent's own visible behavior.

Repeat this step for any package that depends on a dependent you just bumped.

## 6. Changelog entry for the changed package

Add an entry under the right Keep a Changelog heading (`Added` / `Changed` / `Fixed` / `Removed`) in `packages/<name>/CHANGELOG.md`, for anything a user would notice.

## 7. Changelog entry for each cascaded dependent

Every package bumped in step 5 also needs its own entry, under `Changed`, naming the upstream package and its new version:

```
### Changed

- Updated `@zap-studio/<upstream>` to <version>.
```

Add more detail only if the upstream change affects what this package's own users see.
