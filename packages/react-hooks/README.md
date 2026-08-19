# @zap-studio/react-hooks

Small, focused, tree-shakeable React hooks. Each hook ships as its own subpath export — importing one never pulls in the others.

## Installation

```bash
npm install @zap-studio/react-hooks
```

## Conventions

- Stable hooks are exported flat from the top-level `.` barrel, each also available from its own subpath (e.g. `@zap-studio/react-hooks/use-is-mobile`) once added.
- Unstable hooks — anything relying on private/non-semver-guaranteed APIs — live under `./unstable`, never re-exported from the top-level barrel.
- No hook file imports another hook file.
