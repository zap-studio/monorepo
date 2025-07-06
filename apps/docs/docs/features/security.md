# Security: CSP & Permissions Policy

Zap.ts is designed with **security** as a first-class concern. Two of the most important web security headers—**Content Security Policy (CSP)** and **Permissions Policy**—are built in and easy to configure.

## Overview

- **CSP**: Prevents XSS and code injection by restricting what scripts, styles, and resources can run on your site.
- **Permissions Policy**: Controls access to powerful browser features (camera, geolocation, etc.) on a per-feature basis.
- **Type-safe config**: All settings are defined in `zap.config.ts` and applied automatically via middleware and Next.js config.

## Why use CSP and Permissions Policy?

- **Mitigate XSS**: CSP blocks inline scripts and only allows trusted sources, making it much harder for attackers to inject code.
- **Limit browser features**: Permissions Policy lets you disable or restrict APIs like camera, microphone, fullscreen, and more, reducing your attack surface.
- **Comply with best practices**: Modern security standards (OWASP, Google, Mozilla) recommend both headers for all production apps.

## How it works in Zap.ts

Zap.ts applies these headers to all app routes using:
- **CSP**: Set dynamically in `src/middleware.ts` (with a nonce for scripts/styles).
- **Permissions Policy**: Set statically in `next.config.ts`.

The configuration is centralized in `zap.config.ts` under the `SECURITY` key.

### Example configuration

```ts
// zap.config.ts
export const ZAP_DEFAULT_SETTINGS = {
  // ...
  SECURITY: {
    CSP: {
      DEFAULT_SRC: ["'self'"],
      SCRIPT_SRC: ["'self'", "'strict-dynamic'"],
      STYLE_SRC: ["'self'"],
      IMG_SRC: ["'self'", "blob:", "data:"],
      FONT_SRC: ["'self'"],
      OBJECT_SRC: ["'none'"],
      BASE_URI: ["'self'"],
      FORM_ACTION: ["'self'"],
      FRAME_ANCESTORS: ["'none'"],
      UPGRADE_INSECURE_REQUESTS: true,
    },
    PERMISSIONS_POLICY: {
      CAMERA: ["()"],
      MICROPHONE: ["()"],
      GEOLOCATION: ["()"],
      // ...other features
    },
  },
};
```

### How headers are set

#### Content Security Policy (CSP)

The middleware generates a unique nonce for each request and builds the CSP header dynamically:

```ts
// src/middleware.ts
function buildCSPHeader(nonce: string): string {
  const { CSP } = ZAP_DEFAULT_SETTINGS.SECURITY;
  const directives = [
    `default-src ${CSP.DEFAULT_SRC.join(" ")}`,
    `script-src ${CSP.SCRIPT_SRC.join(" ")} 'nonce-${nonce}'`,
    `style-src ${CSP.STYLE_SRC.join(" ")} 'nonce-${nonce}'`,
    // ...
  ];
  if (CSP.UPGRADE_INSECURE_REQUESTS) {
    directives.push("upgrade-insecure-requests");
  }
  return directives.join("; ");
}

// In the middleware:
const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
const cspHeader = buildCSPHeader(nonce);
response.headers.set("Content-Security-Policy", cspHeader);
```

#### Permissions Policy

Permissions Policy is now set in `next.config.ts` for all routes, making the middleware lighter and more efficient (no nonce or per-request logic needed):

```ts
// next.config.ts
import { ZAP_DEFAULT_SETTINGS } from "./zap.config";

const permissionsPolicy = Object.entries(ZAP_DEFAULT_SETTINGS.SECURITY.PERMISSIONS_POLICY)
  .map(([feature, values]) => `${feature}=${values.join(", ")}`)
  .join(", ");

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ...other headers
          {
            key: "Permissions-Policy",
            value: permissionsPolicy,
          },
        ],
      },
    ];
  },
  // ...
};
```

## Customizing your policy

- **CSP**: Add or remove sources in `zap.config.ts` to allow only what your app needs. For example, to allow scripts from a CDN:
  ```ts
  SCRIPT_SRC: ["'self'", "https://cdn.example.com"],
  ```
- **Permissions Policy**: Set features to `"()"` to disable, or specify origins to allow. For example, to allow camera for your domain and a specific domain:
  ```ts
  CAMERA: ["'self'", "https://trusted.example.com"],
  ```

## Best practices

- **Use nonces for CSP**: Zap.ts automatically adds a unique nonce to scripts and styles for maximum security.
- **Start strict, relax as needed**: Begin with the most restrictive policy and only allow what you need.
- **Test thoroughly**: Use browser devtools to check headers and ensure your app works as expected.
- **Review regularly**: Update your policy as your app evolves and new features are added.

## Learn more

- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Guide on Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)
- [Permission Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)