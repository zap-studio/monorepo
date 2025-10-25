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

### 4. Commit the Changeset

```bash
git add .changeset
git commit -m "chore: add changeset for waitlist changes"
git push origin feat/<package-name>
```

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

Once features are ready in `develop`, prepare for release:

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

#### 2. Review and Commit Version Changes

```bash
# Review the changes
git diff

# Commit the version changes
git add .
git commit -m "chore: version packages"
git push origin develop
```

#### 3. Create a Release PR to `main`

1. Create a PR from `develop` to `main`
2. Title: `Release: <date>` or `Release: <version>`
3. Include a summary of all packages being released
4. Request reviews from maintainers

### Publishing the Release

Once the release PR is approved and merged into `main`:

#### 1. Checkout `main` and Pull

```bash
git checkout main
git pull origin main
```

#### 2. Publish to NPM

```bash
pnpm changeset publish
```

This command will:
- Publish all updated packages to npm
- Create git tags for each published package

#### 3. Push Tags to GitHub

```bash
git push --follow-tags
```

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

## CI/CD Integration

### Automated Checks

All PRs should pass:
- Linting (Biome)
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

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Dependencies
        run: pnpm install

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Best Practices

### For Contributors

1. **Always create changesets** for user-facing changes
2. **Write clear changeset summaries** - these become your CHANGELOG
3. **Use semantic versioning correctly** - be conservative with major versions
4. **Test thoroughly** before creating a PR
5. **Keep feature branches focused** - one package per branch when possible
6. **Keep PRs small and focused** - easier to review and less risky

### For Maintainers

1. **Review changesets carefully** - ensure version bumps are appropriate
2. **Batch releases when possible** - don't release after every small change
3. **Communicate breaking changes** - announce them in advance
4. **Keep CHANGELOG.md clean** - edit generated entries if needed
5. **Test in `develop` before releasing** - catch integration issues early
6. **Document migration paths** for breaking changes

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

If publish fails:
1. Check npm authentication: `npm whoami`
2. Verify package.json names are unique
3. Check if version already exists on npm
4. Ensure you have publish rights to the package scope

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
