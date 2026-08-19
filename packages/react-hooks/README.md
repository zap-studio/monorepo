# @zap-studio/react-hooks

Small, focused React hooks. Each one ships as its own subpath export, so importing one never pulls in the others.

## Motivation

Most React hook collections are either one giant package (import a `useDebounce` and your bundle quietly gains forty other hooks' worth of code) or a pile of one-off gists copy-pasted between projects, each with its own subtly different bugs around SSR safety and cleanup.

Every hook in `@zap-studio/react-hooks` ships as its own standalone, side-effect-free module — import it on its own and it tree-shakes cleanly. Hooks never depend on each other, so pulling in `useIsMobile` never drags in unrelated code.

## Installation

```bash
npm install @zap-studio/react-hooks
```

## Quick Start

Import hooks from the top-level package, or from their own subpath if you want the narrowest possible import:

```tsx
import { useIsMobile, useMediaQuery } from "@zap-studio/react-hooks";
// or, equivalently:
// import { useIsMobile } from "@zap-studio/react-hooks/use-is-mobile";
// import { useMediaQuery } from "@zap-studio/react-hooks/use-media-query";

function Nav() {
  const isMobile = useIsMobile(); // true below 768px
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  return isMobile ? <MobileNav dark={prefersDark} /> : <DesktopNav dark={prefersDark} />;
}
```

Both hooks are SSR-safe: they return `false` until the client subscribes to `matchMedia`, so server-rendered and first-client-render output match — no hydration warnings.

## Available Hooks

| Hook            | What it does                                                            |
| --------------- | ----------------------------------------------------------------------- |
| `useMediaQuery` | Matches the viewport against an arbitrary CSS media query string        |
| `useIsMobile`   | `true` below a breakpoint (768px by default) — built on `useMediaQuery` |
| `useIsClient`   | `true` only after the client has mounted — SSR hydration guard          |

More hooks land incrementally.

## Conventions

- Every stable hook is available both from the top-level package and from its own subpath (`@zap-studio/react-hooks/use-is-mobile`) — same function either way.
- Hooks relying on private, non-semver-guaranteed APIs live under `@zap-studio/react-hooks/unstable` and are never exported from the top-level package.
