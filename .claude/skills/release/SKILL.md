---
name: release
description: Use when releasing one or more @zap-studio packages that already have a bumped version and changelog — working out release order, tagging, and creating GitHub releases.
---

# Release

**Required first:** run the `bump-and-changelog` skill. This skill assumes each package already has its new version in `package.json`/`jsr.json` and its `CHANGELOG.md` entry written.

## What the agent does

1. Verify the bump really happened.
2. Work out release order.
3. Create and push git tags.
4. Create the GitHub release for each tag.

## What the human does

Publish to npm and JSR. Both need the human's own login — the agent never runs these:

- **npm**: `pnpm publish` from inside the package folder, after the human logs in.
- **JSR**: `pnpm dlx jsr publish` from inside the package folder, after the human's own browser-based `jsr` login.

The agent's job ends at "here is the order, the tags exist, the GitHub releases exist." Say this explicitly when handing off — do not imply the packages are live on npm/JSR yet.

## 1. Verify the bump actually happened

For each package, compare the local version against what is currently published:

- npm: `pnpm view @zap-studio/<name> version`
- JSR: check the package's page on the JSR registry, or the equivalent lookup command

If local is above published, the bump ran — proceed.

If it is not above published, stop and ask the human before doing anything else. Do not guess whether the bump was skipped or the registry is just slow to update — only the human can tell which.

## 2. Release order

A package must release no earlier than any workspace package it depends on. If a dependent publishes first, its manifest points at a version of the dependency that is not on the registry yet, and installs break.

Build the order from the workspace dependency graph: for each package being released, check its `dependencies` and `peerDependencies` for other `@zap-studio/*` packages. Any such package that is also in this batch must come first.

Present the order to the human before doing anything — it is also the order they need for the npm/JSR publish commands.

## 3. Tag and push

Create all tags first, in release order, then push them together in one command:

```
git tag "@zap-studio/<package-a>@<version>"
git tag "@zap-studio/<package-b>@<version>"
git push origin "@zap-studio/<package-a>@<version>" "@zap-studio/<package-b>@<version>"
```

Push the explicit tag list, not `git push --tags` — that pushes every local tag, including any unrelated one.

Pushing a tag is visible to everyone with repo access. Confirm the full list and order with the human before pushing any of them.

## 4. GitHub release per tag

1. Check existing releases first to copy the current shape: `gh release list` and `gh release view <tag>`.
2. Tag and title are the same string: `@zap-studio/<package>@<version>`. No `v` prefix.
3. The body is the matching `CHANGELOG.md` section, with the same headings. Copy it — do not write new text.
4. Create it with:
   ```
   gh release create "@zap-studio/<package>@<version>" --title "@zap-studio/<package>@<version>" --notes-file <file>
   ```
5. Mark it as latest only when it really is the newest release in the repo.

One release per package per version — never bundle several packages' notes into a single release.
