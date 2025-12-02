# Release Process

This document outlines the release process for the Zap Studio monorepo, which uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

## Branch Strategy

The repository follows a structured branching model:

- **`main`** - Production branch containing stable, released code
- **`staging`** - Integration branch for ongoing development
- **`feat/<package-name>`** - Feature branches for specific packages (e.g., `feat/waitlist`, `feat/fetch`)

## Making Changes

### 1. Create a Feature Branch

Create a feature branch from `staging` for the package you're working on:

```bash
git checkout staging
git pull origin staging
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
```

This creates a markdown file in `.changeset/` directory with your change description.

### 4. Commit and Push Your Changes

```bash
git add .changeset/
git commit -m "chore: add changeset"
git push origin feat/<package-name>
```

### 5. Create a Pull Request to `staging`

1. Open a PR from your feature branch to `staging`
2. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Testing performed
   - Breaking changes (if any)
3. Request reviews from maintainers
4. Address any feedback
5. Once approved, merge into `staging`

## Release Process

### Preparing a Release

Once features are ready in `staging`, prepare for release.

**IMPORTANT:** All versioning must be done on the `staging` branch before creating a release PR to `main`.

#### 1. Version the Packages

On the `staging` branch, consume the changesets to version packages:

```bash
git checkout staging
git pull origin staging
pnpm changeset version
```

This command will:
- Read all changeset files
- Update package versions in `package.json` files
- Update `CHANGELOG.md` files
- Delete the processed changeset files

#### 2. Commit and Push Version Changes

```bash
# Review the changes
git status
git diff

# Commit the version updates
git add .
git commit -m "chore: version packages"

# Push to staging
git push origin staging
```

#### 3. Create a Release PR to `main`

**CRITICAL:** The release PR must include all the version updates from step 1.

1. Create a PR to `main`
2. Title: `Release: <date>` or `Release: <version>`
3. Include a summary of all packages being released
4. Verify the PR includes updated `package.json` versions and `CHANGELOG.md` files
5. Request reviews from maintainers

### Publishing the Release

Once the release PR is approved and merged into `main`, the `main` branch will contain all the updated versions from `staging`.

**At this point, NO versioning should happen - only building, testing, and publishing.**

#### 1. Checkout `main` and Pull

```bash
git checkout main
git pull origin main
```

#### 2. Publish to npm

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

#### 3. Publish to JSR (Manual)

After publishing to npm, manually publish packages to [JSR](https://jsr.io) (JavaScript Registry).

**Pre-publish Checklist:**

- [ ] **Version matches**: Ensure the `version` in `jsr.json` matches the `version` in `package.json`
- [ ] **Exports match**: Verify that exports in `jsr.json` match those in `package.json`, but point directly to TypeScript source files (e.g., `./src/index.ts` instead of `./dist/index.js`) since transpilation is handled by the JSR registry
- [ ] **Package name**: Confirm the JSR package name follows the `@zap-studio/<package>` convention

**Publishing Steps:**

```bash
# Navigate to the package directory
cd packages/fetch

# Verify jsr.json is up to date (check version and exports manually)
cat jsr.json

# Publish to JSR
npx jsr publish
```

**Example `jsr.json`:**

```json
{
  "name": "@zap-studio/fetch",
  "version": "1.0.0",
  "exports": "./src/index.ts"
}
```

Repeat this process for each package that publishes to JSR.

#### 4. Push Tags to GitHub

```bash
git push --follow-tags
```

**Note:** This pushes the git tags created by `changeset publish` to the remote repository.

#### 5. Create GitHub Releases

For each published package:
1. Go to GitHub Releases
2. Create a new release from the tag (e.g., `@zap-studio/waitlist@1.2.0`)
3. Add release notes from the CHANGELOG
4. Publish the release

#### 6. Merge `main` back to `staging`

Keep `staging` in sync with `main`:

```bash
git checkout staging
git merge main
git push origin staging
```

## Changeset Configuration

The project uses the following changeset configuration (`.changeset/config.json`):

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",  // Publishes packages as public to npm
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["website", "zap-ts-docs"]  // Don't version these packages
}
```

**Key Settings:**
- **`"commit": false`**: You need to manually commit changesets and version updates
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

Versioning should ONLY happen on the `staging` branch.

**Correct flow:**
1. Version on `staging` → 2. PR to `main` → 3. Publish on `main`

### ❌ DON'T: Forget to merge `main` back to `staging`

After publishing, always merge `main` back to `staging` to keep the tags and any minor changes in sync.

## Best Practices

### For Contributors

1. **Always create changesets** for user-facing changes
2. **Write clear changeset summaries** - these become your CHANGELOG
3. **Use semantic versioning correctly** - be conservative with major versions
4. **Test thoroughly** before creating a PR
5. **Keep feature branches focused** - one package per branch when possible
6. **Keep PRs small and focused** - easier to review and less risky
7. **Commit changeset files** - remember to commit the generated changeset files after running `pnpm changeset`
8. **Run `pnpm changeset` once per logical change** - multiple related changes can go in one changeset

### For Maintainers

1. **Review changesets carefully** - ensure version bumps are appropriate
2. **Batch releases when possible** - don't release after every small change
3. **Communicate breaking changes** - announce them in advance
4. **Keep CHANGELOG.md clean** - edit generated entries if needed
5. **Test in `staging` before releasing** - catch integration issues early
6. **Document migration paths** for breaking changes
7. **Use `publish-packages` script** - ensures all checks pass before publishing
8. **Verify commits** - ensure changeset and version files are properly committed

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
# Add a changeset
pnpm changeset

# Version packages
pnpm changeset version

# Build, lint, test, and publish to npm (full workflow)
pnpm publish-packages

# Publish to npm only (skip build/lint/test)
pnpm changeset publish

# Check changeset status
pnpm changeset status

# Publish to JSR (run from package directory, after verifying jsr.json)
pnpm dlx jsr publish
```

### Workflow Summary

1. **Feature Development**
   ```bash
   git checkout -b feat/my-feature
   # Make changes...
   pnpm changeset
   git add .changeset/
   git commit -m "chore: add changeset"
   git push
   ```

2. **Release Preparation** (on `staging`)
   ```bash
   pnpm changeset version
   git add .
   git commit -m "chore: version packages"
   git push
   # Create PR from staging to main
   ```

3. **Publishing** (on `main` - after merging release PR)
   ```bash
   pnpm publish-packages  # Builds, tests, and publishes to npm
   git push --follow-tags

   # Publish to JSR (for each package, after verifying jsr.json)
   cd packages/fetch
   pnpm dlx jsr publish
   ```

## Troubleshooting

### Changesets Not Found

If `pnpm changeset` isn't working, ensure Changesets is installed:

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

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
1. Verify you ran `pnpm changeset version` on `staging` before the release PR
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
