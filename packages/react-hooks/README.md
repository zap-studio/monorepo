# @zap-studio/react-hooks

Small, focused React hooks. Each one ships as its own subpath export, so importing one never pulls in unrelated hooks.

Full documentation: [docs/react-hooks](https://github.com/zap-studio/monorepo/tree/main/docs/react-hooks)

## Installation

```bash
npm install @zap-studio/react-hooks
```

## Quick Start

Import hooks from the top-level package, or from their own subpath if you want the narrowest possible import:

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

Both hooks are SSR-safe: they return `false` until the client subscribes to `matchMedia`, so server-rendered and first-client-render output match — no hydration warnings.
