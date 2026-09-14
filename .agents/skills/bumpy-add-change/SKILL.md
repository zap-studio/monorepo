---
name: add-change
description: Create a bumpy bump file describing which packages changed and how, for version bumping and changelog generation. Use when the user wants to record a change, add a bump file, or prepare packages for release.
argument-hint: '[description of changes]'
allowed-tools: Read Grep Glob Bash Edit Write
---

# Create a bumpy bump file

You are helping the user create a **bumpy bump file** — a markdown file in `.bumpy/` that describes which packages changed and how. Bumpy uses these to bump versions and generate changelogs.

## Steps

### 1. Gather context

First, understand what changed. Run these in parallel:

- `git diff --stat` — see which files changed
- `git diff --cached --stat` — see staged changes
- `bumpy status --json` — see if there are already pending bump files

If the user provided a description via `$ARGUMENTS`, use that as additional context for understanding the change.

Review the diff output to understand the scope of changes.

### 2. Identify affected packages

Determine which workspace packages are affected by the changes. Map changed files to their packages based on directory structure.

If unsure which packages exist, run:

```bash
bumpy status --packages 2>/dev/null || cat package.json
```

### 3. Determine bump levels

For each affected package, choose the appropriate bump level:

| Level     | When to use                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| **major** | Breaking changes: removed/renamed exports, changed function signatures, dropped support |
| **minor** | New features: added exports, new options, new functionality                             |
| **patch** | Bug fixes, internal refactors, documentation, dependency updates                        |

Use `none` in a bump file to acknowledge a change without triggering a direct bump. Cascading bumps from other packages can still apply normally.

### 4. Write a clear summary

Write a concise summary for the CHANGELOG entry. Keep it short — ideally a single sentence, at most two. Good summaries:

- Start with a verb: "Added...", "Fixed...", "Refactored..."
- Focus on user-facing impact, not implementation details
- Are specific enough to be useful months later
- Avoid filler, jargon, or restating the bump level
- Don't list every file changed — describe the logical change

Bad: "Updated the authentication module to fix an issue where the token refresh mechanism was not properly handling expired refresh tokens, causing silent failures in the auth flow."
Good: "Fixed token refresh failing silently on expired refresh tokens."

### 5. Create or update the bump file

Check if there are already bump files on this branch (from step 1's `bumpy status`). If one exists that covers the same logical change, **update it in place** by editing the `.bumpy/<name>.md` file directly — adjust the package list, bump levels, and summary to reflect the current state of the branch. Don't create a new bump file for every incremental change on the same branch.

If no relevant bump file exists yet, create one with the non-interactive CLI:

```bash
bumpy add \
  --packages "<pkg1>:<bump>,<pkg2>:<bump>" \
  --message "<summary>" \
  --name "<short-descriptive-name>"
```

The `--name` should be a short kebab-case slug describing the change (e.g., `fix-auth-token-refresh`, `add-encryption-api`).

### Example

If the user fixed a bug in `@myorg/auth` that also required a type change in `@myorg/types`:

```bash
bumpy add \
  --packages "@myorg/auth:patch,@myorg/types:patch" \
  --message "Fixed token refresh failing silently when the refresh token has expired." \
  --name "fix-token-refresh"
```

## Advanced: cascading bumps

If a change in a core package should explicitly cascade to dependents with specific bump levels, write the bump file directly instead of using the CLI:

```bash
cat > .bumpy/<name>.md << 'EOF'
---
"@myorg/core":
  bump: minor
  cascade:
    "@myorg/plugin-*": patch
    "@myorg/cli": minor
"@myorg/utils": patch
---

Added new encryption provider. Plugins need a patch bump for compatibility.
EOF
```

## Advanced: omitting an entry from the changelog

If a change needs a version bump but shouldn't appear in the changelog (internal refactor, dependency tidy-up, etc.), add the `$changelog: false` reserved key. The bump still applies and cascades normally, but this file's body is omitted from the changelog and release notes — write the body anyway as a note for reviewers:

```bash
cat > .bumpy/<name>.md << 'EOF'
---
"@myorg/core": patch
$changelog: false
---

Internal refactor of the config loader — no user-facing change.
EOF
```

It's a file-level flag (a bump file has one shared body), so it applies to every package the file lists.

## Important notes

- Only include packages that have **actual code changes** — bumpy handles dependency propagation automatically
- If the user hasn't made any changes yet, ask what they're planning to change
- If the change doesn't affect any publishable packages (e.g., only root config files), suggest using `bumpy add --empty` to satisfy CI checks
- One bump file per logical change — don't combine unrelated changes
- **Keep bump files up to date** — as work continues on a branch, the bump file should reflect the final state of all changes, not just the first commit. If packages were added/removed or the bump level changed (e.g., a patch fix grew into a minor feature), update the existing bump file accordingly
