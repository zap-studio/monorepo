# Security

Zap.ts is designed with **security** as a first-class concern. Two of the most important web security headers—**Content Security Policy (CSP)** and **Permissions Policy**—are built in and easy to configure.

## Overview

- **CSP**: Prevents XSS and code injection by restricting what scripts, styles, and resources can run on your site.
- **Permissions Policy**: Controls access to powerful browser features (camera, geolocation, etc.) on a per-feature basis.
- **Type-safe config**: All settings are defined in `zap.config.ts` and applied automatically via Next.js config.

## Why use CSP and Permissions Policy?

- **Mitigate XSS**: CSP blocks inline scripts and only allows trusted sources, making it much harder for attackers to inject code.
- **Limit browser features**: Permissions Policy lets you disable or restrict APIs like camera, microphone, fullscreen, and more, reducing your attack surface.
- **Comply with best practices**: Modern security standards (OWASP, Google, Mozilla) recommend both headers for all production apps.

## How it works in Zap.ts

Zap.ts applies these headers to all app routes using Next.js's built-in header configuration:
- **CSP**: Set statically in `next.config.ts` for consistent security across all routes.
- **Permissions Policy**: Set statically in `next.config.ts` for efficient policy enforcement.

The configuration is centralized in `zap.config.ts` under the `SECURITY` key.

### Example configuration

```ts
// zap.config.ts
export const ZAP_DEFAULT_SETTINGS = {
  // ...
  SECURITY: {
    CSP: {
      DEFAULT_SRC: ["'self'"],
      SCRIPT_SRC: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      STYLE_SRC: ["'self'", "'unsafe-inline'"],
      IMG_SRC: ["'self'", "blob:", "data:"],
      FONT_SRC: ["'self'"],
      OBJECT_SRC: ["'none'"],
      BASE_URI: ["'self'"],
      FORM_ACTION: ["'self'"],
      FRAME_ANCESTORS: ["'none'"],
      BLOCK_ALL_MIXED_CONTENT: false,
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

Both CSP and Permissions Policy headers are set in `next.config.ts` for optimal performance and consistency:

```ts
// next.config.ts
import { ZAP_DEFAULT_SETTINGS } from "./zap.config";

function buildCSPHeader(): string {
  const { CSP } = ZAP_DEFAULT_SETTINGS.SECURITY;

  const directives = [
    `default-src ${CSP.DEFAULT_SRC.join(" ")}`,
    `script-src ${CSP.SCRIPT_SRC.join(" ")}`,
    `style-src ${CSP.STYLE_SRC.join(" ")}`,
    `img-src ${CSP.IMG_SRC.join(" ")}`,
    `font-src ${CSP.FONT_SRC.join(" ")}`,
    `object-src ${CSP.OBJECT_SRC.join(" ")}`,
    `base-uri ${CSP.BASE_URI.join(" ")}`,
    `form-action ${CSP.FORM_ACTION.join(" ")}`,
    `frame-ancestors ${CSP.FRAME_ANCESTORS.join(" ")}`,
  ];

  if (CSP.BLOCK_ALL_MIXED_CONTENT) {
    directives.push("block-all-mixed-content");
  }

  if (CSP.UPGRADE_INSECURE_REQUESTS) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function buildPermissionsPolicy(): string {
  return Object.entries(ZAP_DEFAULT_SETTINGS.SECURITY.PERMISSIONS_POLICY)
    .map(([feature, values]) => `${feature}=${values.join(", ")}`)
    .join(", ");
}

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildCSPHeader(),
          },
          {
            key: "Permissions-Policy",
            value: buildPermissionsPolicy(),
          },
          // ...other security headers
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

- **Start strict, relax as needed**: Begin with the most restrictive policy and only allow what you need.
- **Test thoroughly**: Use browser devtools to check headers and ensure your app works as expected.
- **Review regularly**: Update your policy as your app evolves and new features are added.
- **Use static configuration**: Setting headers in `next.config.ts` provides better performance than dynamic middleware generation.

## Learn more

- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Guide on Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)
- [Permission Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)