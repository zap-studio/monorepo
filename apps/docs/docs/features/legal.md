# Legal Pages

Zap.ts includes templates for _essential legal pages_ to integrate them even faster. These pages are fully customizable and can be found in the public legal routes of your app.

## Overview

- **Cookie Policy:** Details what cookies are used, why, and how users can manage them.
- **Privacy Policy:** Explains how user data is collected, used, and protected.
- **Terms of Service:** Outlines the rules for using your app and your responsibilities.

All legal page content is located in the `src/zap/legal/` directory as MDX files. These are rendered in the `/legal` route using dedicated page components.

Each page component uses the `LegalPage` component which loads and renders the corresponding MDX file by slug. 

## Customizing legal pages

To update the content, add your company details, or translate the legal pages, edit the MDX files in `src/zap/legal/`.

In addition, metadata for SEO and page titles can be provided in the MDX file as either frontmatter (YAML) or as an exported `metadata` object. The loader supports both formats.

- You can use YAML frontmatter (at the top of the file, between `---` lines) _or_ export a `metadata` object in JavaScript/TypeScript syntax.
- Both are supported and will be picked up for SEO and page titles.

**Example (YAML frontmatter):**

```mdx
---
title: "Cookie Policy | Zap.ts"
description: "Learn how we use cookies on our website."
---

# Cookie Policy
...
```

**Example (exported metadata):**

```mdx
export const metadata = {
  title: "Privacy Policy | Zap.ts",
  description: "Learn how we handle your personal information.",
};

# Privacy Policy
...
```

**Page component example:**

```tsx
// src/app/(public)/(legal)/privacy-policy/page.tsx
import {
  LegalPage,
  generateLegalMetadata,
} from '@/zap/components/legal/legal-template';

const SLUG = 'privacy-policy';

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function PrivacyPolicyPage() {
  return <LegalPage slug={SLUG} />;
}
```

## Tips

- **Add your contact information** in each policy so users can reach you.
- **Consult a lawyer** to ensure your policies meet legal requirements for your region and audience.
- **Keep your legal pages up to date** with changes in your app or regulations.
