# Legal Pages

Zap.ts includes templates for _essential legal pages_ to integrate them even faster. These pages are fully customizable and can be found in the public legal routes of your app.

## Overview

- **Cookie Policy:** Details what cookies are used, why, and how users can manage them.
- **Privacy Policy:** Explains how user data is collected, used, and protected.
- **Terms of Service:** Outlines the rules for using your app and your responsibilities.

All legal pages are located in the `/legal` route and rendered using MDX for easy editing.

## Customizing legal pages

You can edit the MDX files in `src/app/(pages)/(public)/(legal)/` to update the content, add your company details, or translate them to other languages.

Each file includes a `metadata` export for SEO and page titles.

Example:

```mdx
// src/app/(pages)/(public)/(legal)/privacy-policy/page.mdx
export const metadata = {
  title: "Privacy Policy | Zap.ts",
  description: "Learn how we handle your personal information.",
};

# Privacy Policy

**Last Updated: March 21, 2025**

> **Note**: This is a template. Replace the placeholder text with your real policy and consult a legal expert to ensure compliance.
```

## Tips

- **Add your contact information** in each policy so users can reach you.
- **Consult a lawyer** to ensure your policies meet legal requirements for your region and audience.
- **Keep your legal pages up to date** with changes in your app or regulations.
