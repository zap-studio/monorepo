# Release Process

This document outlines the release process for the Zap Studio monorepo, which uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

## Branch Strategy

The repository follows a structured branching model:

- **`main`** - Production branch containing stable, released code
- **`develop`** - Integration branch for ongoing development
- **`feat/<package-name>`** - Feature branches for specific packages (e.g., `feat/waitlist`, `feat/fetch`)

## Making Changes

### 1. Create a Feature Branch

Create a feature branch from `develop` for the package you're working on:

```bash
git checkout develop
git pull origin develop
git checkout -b feat/<package-name>
```

Examples:
- `feat/waitlist` for changes to `@zap-studio/waitlist`
- `feat/fetch` for changes to `@zap-studio/fetch`

### 2. Make Your Changes

Implement your changes, ensuring:
- Code follows the project's style guide
- Tests are added/updated
- Documentation is updated
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/)

```bash
# Example commit messages
git commit -m "feat(waitlist): add new referral tracking feature"
git commit -m "fix(fetch): resolve timeout handling issue"
git commit -m "docs(waitlist): update API documentation"
```

### 3. Add a Changeset

When you've made changes that should trigger a release, create a changeset:

```bash
pnpm changeset
```

This interactive command will:
1. Ask which packages have changed
2. Ask whether the change is a `patch`, `minor`, or `major` version bump
3. Prompt you to write a summary of the changes
4. **Automatically commit the changeset** (thanks to `"commit": true` in the config)

**Version Bump Guidelines (Semantic Versioning):**
- **Major (x.0.0)**: Breaking changes that require users to modify their code
- **Minor (0.x.0)**: New features that are backward-compatible
- **Patch (0.0.x)**: Bug fixes and minor improvements

**Example:**
```
🦋  Which packages would you like to include? 
✔ @zap-studio/waitlist

🦋  Which type of change is this for @zap-studio/waitlist?
✔ minor

🦋  Please enter a summary for this change:
✔ Add support for custom referral codes

🦋  Changeset added and committed! ✨
```

This creates a markdown file in `.changeset/` directory with your change description and automatically commits it.

### 4. Push Your Changes

```bash
git push origin feat/<package-name>
```

**Note:** Since changesets are now automatically committed, you don't need to manually stage and commit them. Just push your feature branch after running `pnpm changeset`.

### 5. Create a Pull Request to `develop`

1. Open a PR from your feature branch to `develop`
2. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Testing performed
   - Breaking changes (if any)
3. Request reviews from maintainers
4. Address any feedback
5. Once approved, merge into `develop`

## Release Process

### Preparing a Release

Once features are ready in `develop`, prepare for release.

**IMPORTANT:** All versioning must be done on the `develop` branch before creating a release PR to `main`.

#### 1. Version the Packages

On the `develop` branch, consume the changesets to version packages:

```bash
git checkout develop
git pull origin develop
pnpm changeset version
```

This command will:
- Read all changeset files
- Update package versions in `package.json` files
- Update `CHANGELOG.md` files
- Delete the processed changeset files
- **Automatically commit these changes** (thanks to `"commit": true` in the config)

The commit message will be generated automatically by changesets, typically: `"chore: version packages"` or similar.

#### 2. Review and Push Version Changes

```bash
# Review the changes that were committed
git show HEAD

# Push to develop
git push origin develop
```

**Note:** You no longer need to manually commit version changes as this is handled automatically by changesets.

#### 3. Create a Release PR to `main`

**CRITICAL:** The release PR must include all the version updates from step 1.

1. Create a PR to `main`
2. Title: `Release: <date>` or `Release: <version>`
3. Include a summary of all packages being released
4. Verify the PR includes updated `package.json` versions and `CHANGELOG.md` files
5. Request reviews from maintainers

### Publishing the Release

Once the release PR is approved and merged into `main`, the `main` branch will contain all the updated versions from `develop`.

**At this point, NO versioning should happen - only building, testing, and publishing.**

#### 1. Checkout `main` and Pull

```bash
git checkout main
git pull origin main
```

#### 2. Publish to NPM

Use the convenient `publish-packages` script that handles the publishing workflow:

```bash
pnpm publish-packages
```

This script will:
1. **Build** all packages (`turbo run build`)
2. **Lint** the codebase (`turbo run lint`)
3. **Run tests** (`turbo run test`)
4. **Publish to npm** (`changeset publish`)
5. **Create git tags** for each published package

**Alternative - Manual Steps:**

If you prefer to run the steps individually:

```bash
# Build and validate
pnpm build
pnpm lint
pnpm test

# Publish
pnpm changeset publish
```

#### 3. Push Tags to GitHub

```bash
git push --follow-tags
```

**Note:** This pushes the git tags created by `changeset publish` to the remote repository.

#### 4. Create GitHub Releases

For each published package:
1. Go to GitHub Releases
2. Create a new release from the tag (e.g., `@zap-studio/waitlist@1.2.0`)
3. Add release notes from the CHANGELOG
4. Publish the release

#### 5. Merge `main` back to `develop`

Keep `develop` in sync with `main`:

```bash
git checkout develop
git merge main
git push origin develop
```

## Changeset Configuration

The project uses the following changeset configuration (`.changeset/config.json`):

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": true,  // Automatically commits changesets and version updates
  "access": "public",  // Publishes packages as public to npm
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["zap-ts-docs"]  // Don't version the docs site
}
```

**Key Settings:**
- **`"commit": true`**: Automatically commits when you run `pnpm changeset` and `pnpm changeset version`
- **`"ignore": ["zap-ts-docs"]`**: The docs site won't be versioned or published to npm
- **`"access": "public"`**: All packages are published publicly to npm

## CI/CD Integration

### Automated Checks

All PRs should pass:
- Linting (Ultracite/Biome)
- Type checking (TypeScript)
- Tests (Vitest)
- Build verification

### Automated Release (Optional)

Consider setting up GitHub Actions for automated releases:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v5

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "latest"
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          publish: pnpm publish-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Note:** The GitHub Action uses the `publish-packages` script, which includes building, linting, and testing before publishing.

## Common Mistakes to Avoid

### ❌ DON'T: Run `changeset version` on `main`

Versioning should ONLY happen on the `develop` branch.

**Correct flow:**
1. Version on `develop` → 2. PR to `main` → 3. Publish on `main`

### ❌ DON'T: Forget to merge `main` back to `develop`

After publishing, always merge `main` back to `develop` to keep the tags and any minor changes in sync.

## Best Practices

### For Contributors

1. **Always create changesets** for user-facing changes
2. **Write clear changeset summaries** - these become your CHANGELOG
3. **Use semantic versioning correctly** - be conservative with major versions
4. **Test thoroughly** before creating a PR
5. **Keep feature branches focused** - one package per branch when possible
6. **Keep PRs small and focused** - easier to review and less risky
7. **Let changesets auto-commit** - don't manually commit changeset files, the tool handles it
8. **Run `pnpm changeset` once per logical change** - multiple related changes can go in one changeset

### For Maintainers

1. **Review changesets carefully** - ensure version bumps are appropriate
2. **Batch releases when possible** - don't release after every small change
3. **Communicate breaking changes** - announce them in advance
4. **Keep CHANGELOG.md clean** - edit generated entries if needed
5. **Test in `develop` before releasing** - catch integration issues early
6. **Document migration paths** for breaking changes
7. **Use `publish-packages` script** - ensures all checks pass before publishing
8. **Verify auto-commits** - check that changesets auto-commits are working properly

### Changeset Examples

#### Adding a Feature (Minor)

```markdown
---
"@zap-studio/waitlist": minor
---

Add support for custom webhook endpoints to receive real-time notifications when users join the waitlist
```

#### Fixing a Bug (Patch)

```markdown
---
"@zap-studio/fetch": patch
---

Fix timeout handling when requests exceed the specified duration
```

#### Breaking Change (Major)

```markdown
---
"@zap-studio/waitlist": major
---

**BREAKING CHANGE**: Rename `addUser` method to `addToWaitlist` for better clarity. Update your code:

```diff
- await waitlist.addUser(email)
+ await waitlist.addToWaitlist(email)
```
```

#### Multiple Packages

```markdown
---
"@zap-studio/waitlist": minor
"@zap-studio/fetch": patch
---

Improve error handling across packages - waitlist now uses the updated fetch error types
```

## Quick Reference

### Common Commands

```bash
# Add a changeset (auto-commits)
pnpm changeset

# Version packages (auto-commits)
pnpm changeset version

# Build, lint, test, and publish (full workflow)
pnpm publish-packages

# Publish only (skip build/lint/test)
pnpm changeset publish

# Check changeset status
pnpm changeset status
```

### Workflow Summary

1. **Feature Development**
   ```bash
   git checkout -b feat/my-feature
   # Make changes...
   pnpm changeset  # Auto-commits changeset
   git push
   ```

2. **Release Preparation** (on `develop`)
   ```bash
   pnpm changeset version  # Auto-commits version updates
   git push
   # Create PR from develop to main
   ```

3. **Publishing** (on `main` - after merging release PR)
   ```bash
   pnpm publish-packages  # Builds, tests, and publishes
   git push --follow-tags
   ```

## Troubleshooting

### Changesets Not Found

If `pnpm changeset` isn't working, ensure Changesets is installed:

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

### Auto-Commit Not Working

If changesets aren't being auto-committed:

1. Check `.changeset/config.json` has `"commit": true`
2. Ensure you have a clean git working directory
3. Verify git is properly configured (user.name and user.email)
4. Check you're not in detached HEAD state

### Merge Conflicts in CHANGELOG

1. Resolve conflicts by keeping both sets of changes
2. Ensure entries are in chronological order (newest first)
3. Re-run `pnpm changeset version` if needed

### Failed Publish

If `publish-packages` or publish fails:
1. Check npm authentication: `npm whoami`
2. Verify package.json names are unique
3. Check if version already exists on npm
4. Ensure you have publish rights to the package scope
5. If build/lint/test fails, fix those first before publishing
6. Use `pnpm changeset publish` directly if you've already validated the build

### "Nothing to publish" Error

If you see "No packages to publish" or similar:
1. Verify you ran `pnpm changeset version` on `develop` before the release PR
2. Check that the version changes were included in the merge to `main`
3. Ensure `package.json` versions are higher than what's on npm
4. The `publish-packages` script does NOT version - it expects versions to already be updated

### Accidental Publish

If you published accidentally:
1. Don't panic - you cannot unpublish after 72 hours
2. Within 72 hours: `npm unpublish <package>@<version>`
3. Otherwise, publish a patch version with a fix

## References

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

## Questions?

If you have questions about the release process, please:
1. Check this guide first
2. Review existing changesets in `.changeset/`
3. Ask in team discussions
4. Open an issue for clarification
