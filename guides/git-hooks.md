# Git Hooks Guide

This document explains the git hooks setup for the Zap Studio monorepo, which uses [Lefthook](https://github.com/evilmartians/lefthook) for git hook management and [Commitlint](https://commitlint.js.org/) for commit message validation.

## Overview

We use git hooks to enforce quality standards automatically before code enters the repository:

- **Pre-commit** - Format and lint code before committing
- **Commit-msg** - Validate commit messages follow conventions

This catches issues early, keeps the codebase clean, and maintains a readable git history.

## Tools

### Lefthook

Fast, flexible git hook manager written in Go:
- **Fast** - Much faster than Husky or other JavaScript-based solutions
- **Cross-platform** - Works on macOS, Linux, Windows
- **Parallel execution** - Runs multiple hooks concurrently
- **Selective staging** - Only processes staged files
- **Zero dependencies** - Single binary, no Node.js required

### Commitlint

Enforces conventional commit message format:
- **Standardized messages** - Consistent commit history
- **Changelog generation** - Enables automated changelogs
- **Semantic versioning** - Works with Changesets for releases
- **Convention-based** - Uses popular Conventional Commits standard

## Configuration

### Lefthook Configuration

The configuration lives in `lefthook.yml`:

```yaml
pre-commit:
  jobs:
    - run: npx ultracite fix
      glob: 
        - "*.js"
        - "*.jsx"
        - "*.ts"
        - "*.tsx"
        - "*.json"
        - "*.jsonc"
        - "*.css"
      stage_fixed: true

commit-msg:
  commands:
    "lint commit message":
      run: npx commitlint --edit {1}
```

### What This Does

**Pre-commit:**
- Runs on `git commit`
- Formats and lints staged files matching the glob patterns
- Only processes JavaScript, TypeScript, JSON, and CSS files
- Automatically stages fixed files (`stage_fixed: true`)
- Fails commit if there are unfixable errors

**Commit-msg:**
- Runs after you write your commit message
- Validates the message follows Conventional Commits
- Fails commit if message format is invalid
- Provides helpful error messages

### Commitlint Configuration

We use the conventional config. This is configured via `package.json`:

```json
{
  "devDependencies": {
    "@commitlint/cli": "^20.1.0",
    "@commitlint/config-conventional": "^20.0.0"
  }
}
```

You can add a `commitlint.config.js` for customization:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Custom rules here if needed
  }
};
```

## Installation

Git hooks are automatically installed when you run:

```bash
pnpm install
```

This is configured via the `prepare` script in `package.json` (if not already present, add it):

```json
{
  "scripts": {
    "prepare": "lefthook install"
  }
}
```

### Manual Installation

If hooks aren't working:

```bash
# Install Lefthook hooks
npx lefthook install

# Verify installation
npx lefthook run pre-commit --no-tty
```

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of:

- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation changes
- **style** - Code style changes (formatting, missing semicolons, etc.)
- **refactor** - Code refactoring (neither fixes a bug nor adds a feature)
- **perf** - Performance improvements
- **test** - Adding or updating tests
- **build** - Changes to build system or dependencies
- **ci** - Changes to CI configuration files
- **chore** - Other changes that don't modify src or test files

### Scope (Optional)

The scope is the package or area of the codebase:

- `waitlist` - @zap-studio/waitlist package
- `fetch` - @zap-studio/fetch package
- `docs` - Documentation
- `deps` - Dependencies
- `*` - Multiple packages

### Subject

Short description of the change:
- Use imperative, present tense: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters

### Examples

**Good commit messages:**

```bash
# Simple feature
git commit -m "feat(waitlist): add referral code validation"

# Bug fix with scope
git commit -m "fix(fetch): handle timeout errors correctly"

# Documentation
git commit -m "docs: update testing guide"

# Breaking change
git commit -m "feat(waitlist)!: change API response format

BREAKING CHANGE: The addToWaitlist method now returns { id, position } instead of { success, id }"

# Multiple packages
git commit -m "chore(*): update dependencies"

# With body
git commit -m "refactor(fetch): simplify error handling

Consolidate error types into single FetchError class.
Remove redundant error codes.
Improve error messages for better debugging."
```

**Bad commit messages:**

```bash
# ❌ No type
git commit -m "update readme"

# ❌ Wrong format
git commit -m "Updated the waitlist package"

# ❌ Too vague
git commit -m "fix: bug fix"

# ❌ Not imperative
git commit -m "feat: added new feature"

# ❌ Capitalized subject
git commit -m "feat: Add new feature"

# ❌ Period at end
git commit -m "fix: resolve issue."
```

## Working with Git Hooks

### Normal Workflow

```bash
# Make your changes
git add src/index.ts

# Commit (hooks run automatically)
git commit -m "feat(fetch): add retry logic"

# Hooks will:
# 1. Format and lint staged files
# 2. Validate commit message
# 3. Stage any auto-fixed files
# 4. Complete the commit if everything passes
```

### If Pre-commit Hook Fails

```bash
# Hook runs and finds issues
git commit -m "feat: add feature"

# Output:
# [Lefthook] Running pre-commit hooks...
# [ultracite] Found 3 errors
# [ultracite] ✗ src/index.ts:10:5 - Expected semicolon
# [Lefthook] Hook failed

# Fix the remaining issues manually
# The auto-fixable issues are already fixed and staged

# Commit again
git commit -m "feat: add feature"
```

### If Commit Message Fails

```bash
# Invalid commit message
git commit -m "update code"

# Output:
# [Lefthook] Running commit-msg hooks...
# ⧗   input: update code
# ✖   subject may not be empty [subject-empty]
# ✖   type may not be empty [type-empty]

# Try again with proper format
git commit -m "feat(api): add new endpoint"
```

### Skipping Hooks (Use Sparingly)

Sometimes you need to skip hooks (e.g., work in progress commits):

```bash
# Skip all hooks
git commit --no-verify -m "wip: work in progress"

# Or use Lefthook-specific
LEFTHOOK=0 git commit -m "wip: experimental change"
```

**Warning:** Only skip hooks for WIP commits.

### Running Hooks Manually

Test hooks without committing:

```bash
# Test pre-commit hook
npx lefthook run pre-commit

# Test commit-msg hook
echo "feat: test message" | npx lefthook run commit-msg
```

## Configuration Details

### Pre-commit: Staged Files Only

The pre-commit hook only processes **staged files**:

```yaml
pre-commit:
  jobs:
    - run: npx ultracite fix
      glob: 
        - "*.ts"
        - "*.tsx"
      stage_fixed: true  # Auto-stage fixed files
```

This means:
- Only files you `git add` are checked
- Untracked files are ignored
- Fast execution (doesn't process entire codebase)

### Auto-staging Fixed Files

When `stage_fixed: true`:

1. You stage a file: `git add src/index.ts`
2. Pre-commit hook runs
3. Ultracite fixes formatting issues
4. Fixed file is automatically re-staged
5. Commit proceeds with formatted code

### Parallel Execution

Lefthook can run multiple tasks in parallel:

```yaml
pre-commit:
  parallel: true
  jobs:
    - run: npx ultracite fix
      glob: ["*.ts", "*.tsx"]
    - run: pnpm test:changed
      glob: ["*.test.ts"]
```

We keep it simple with just formatting for now.

## Customizing Hooks

### Adding Type Checking

Add TypeScript type checking to pre-commit:

```yaml
pre-commit:
  parallel: true
  jobs:
    format:
      run: npx ultracite fix
      glob: ["*.ts", "*.tsx", "*.js", "*.jsx"]
      stage_fixed: true
    
    typecheck:
      run: pnpm check-types
      glob: ["*.ts", "*.tsx"]
```

### Adding Tests

Run tests on pre-commit:

```yaml
pre-commit:
  parallel: true
  jobs:
    format:
      run: npx ultracite fix
      glob: ["*.ts", "*.tsx"]
      stage_fixed: true
    
    test:
      run: pnpm test:changed
      glob: ["*.ts", "*.tsx"]
```

### Pre-push Hook

Add a pre-push hook for more expensive checks:

```yaml
pre-push:
  parallel: true
  commands:
    "run tests":
      run: pnpm test
    "check types":
      run: pnpm check-types
    "build packages":
      run: pnpm build
```

### Scoped Hooks

Run hooks only in specific directories:

```yaml
pre-commit:
  jobs:
    - run: npx ultracite fix
      glob: ["packages/**/*.ts"]
      stage_fixed: true
```

## Commitlint Rules

### Default Rules

The conventional config enforces:

- **type-enum** - Type must be valid (feat, fix, docs, etc.)
- **type-case** - Type must be lowercase
- **type-empty** - Type is required
- **subject-empty** - Subject is required
- **subject-case** - Subject must be sentence-case or lowercase
- **subject-full-stop** - Subject must not end with period
- **header-max-length** - Header must be ≤ 72 characters
- **body-leading-blank** - Body must have blank line after subject

### Custom Rules

Create `commitlint.config.js`:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100], // Increase max length
    "scope-enum": [
      2,
      "always",
      [
        "waitlist",
        "fetch",
        "docs",
        "deps",
        "ci",
        "*",
      ],
    ],
    "scope-empty": [2, "never"], // Require scope
  },
};
```

### Breaking Changes

For breaking changes, use `!` or add `BREAKING CHANGE` in body:

```bash
# Using !
git commit -m "feat(api)!: remove deprecated endpoint"

# Using footer
git commit -m "feat(api): update response format

BREAKING CHANGE: API now returns array instead of object"
```

## Troubleshooting

### Hooks Not Running

1. **Check installation:**
   ```bash
   npx lefthook install
   ```

2. **Verify `.git/hooks` contains Lefthook hooks:**
   ```bash
   ls -la .git/hooks/
   # Should see pre-commit and commit-msg
   ```

3. **Check Lefthook is installed:**
   ```bash
   npx lefthook version
   ```

### Hooks Running on Wrong Files

Check your glob patterns in `lefthook.yml`:

```yaml
pre-commit:
  jobs:
    - run: npx ultracite fix
      glob: 
        - "*.ts"    # matches .ts files
        - "**/*.ts" # matches .ts files in subdirectories
```

### Slow Hook Execution

1. **Limit glob patterns** - Only include necessary file types
2. **Use parallel execution** - Enable `parallel: true`
3. **Skip expensive operations** - Move heavy checks to CI

### Commitlint Not Working

1. **Check commitlint is installed:**
   ```bash
   npx commitlint --version
   ```

2. **Test commitlint manually:**
   ```bash
   echo "test message" | npx commitlint
   ```

3. **Verify config:**
   ```bash
   npx commitlint --print-config
   ```

### Conflicts with Other Git Hooks

If you have other hooks (e.g., from Husky):

1. Remove old hook managers:
   ```bash
   pnpm remove husky
   rm -rf .husky
   ```

2. Reinstall Lefthook:
   ```bash
   npx lefthook install
   ```

## Best Practices

### 1. Don't Skip Hooks Without Reason

Only use `--no-verify` for:
- WIP commits on feature branches
- Emergency hotfixes (with immediate follow-up)
- Commits that will be squashed before merging

### 2. Write Clear Commit Messages

Good messages help with:
- Code review
- Changelog generation
- Debugging (git blame, git bisect)
- Understanding project history

### 3. Commit Early and Often

Small, focused commits are better than large ones:
- Easier to review
- Easier to revert
- Clearer history
- Faster hook execution

### 4. Keep Hooks Fast

Hooks should complete in seconds, not minutes:
- Only check staged files
- Use parallel execution
- Move expensive checks to CI
- Optimize glob patterns

### 5. Document Exceptions

If you skip hooks, explain why in the commit message:

```bash
git commit --no-verify -m "wip(fetch): experimenting with new API

Skipping hooks for experimental work.
Will fix lint errors before final commit."
```

## Uninstalling Hooks

If you need to remove hooks:

```bash
# Uninstall Lefthook hooks
npx lefthook uninstall

# Verify removal
ls -la .git/hooks/
```

## References

- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## Questions?

If you have questions about git hooks:
1. Check this guide first
2. Review `lefthook.yml` configuration
3. Test hooks manually with `lefthook run`
4. Ask in team discussions
