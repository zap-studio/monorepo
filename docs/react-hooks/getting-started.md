# Getting Started

Install @zap-studio/react-hooks.

## Installation

```bash
# npm
npm install @zap-studio/react-hooks
# yarn
yarn add @zap-studio/react-hooks
# pnpm
pnpm add @zap-studio/react-hooks
# bun
bun add @zap-studio/react-hooks
# deno
deno add jsr:@zap-studio/react-hooks
```

## Import a Hook

Import from the top-level package, or from a hook's own subpath if you want the narrowest possible import — both resolve to the same function:

```tsx
import { useIsMobile, useMediaQuery } from "@zap-studio/react-hooks";
// or, equivalently:
// import { useIsMobile } from "@zap-studio/react-hooks/sensors/use-is-mobile";
// import { useMediaQuery } from "@zap-studio/react-hooks/sensors/use-media-query";

function Nav() {
  const isMobile = useIsMobile(); // true below 768px
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  return isMobile ? <MobileNav dark={prefersDark} /> : <DesktopNav dark={prefersDark} />;
}
```

Both hooks are SSR-safe: they return `false` until the client subscribes to `matchMedia`, so server-rendered and first-client-render output match — no hydration warnings. Every hook in this package follows the same rule: a browser-only API gets a safe, deterministic default during server rendering.

## Browse Hooks by Category

Each category page lists every hook in it, with a runnable example and — for hooks that wrap a specific browser API — an [MDN](https://developer.mozilla.org/) reference and browser support note.

- [Sensors](sensors.md)
- [DOM / Element Interaction](dom.md)
- [Input](input.md)
- [Media](media.md)
- [History & Navigation](navigation.md)
- [Network](network.md)
- [PWA](pwa.md)
- [Commerce](commerce.md)
- [Lifecycle](lifecycle.md)
- [State](state.md)
- [Debug / Observability](debug.md)
