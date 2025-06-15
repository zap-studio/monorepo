# Legal Pages

Zap.ts includes built-in legal pages as part of its core package, ensuring your application starts with essential compliance foundations. These pages—Cookie Policy, Privacy Policy, and Terms of Service—are pre-configured under the `/legal` route and written in MDX for easy customization.

## Customizing Legal Pages

The legal pages are located in `src/app/(legal)/` and use MDX format, allowing you to edit content with a mix of Markdown and JSX. Here’s how to customize them:

### File Locations

- **Cookie Policy**: `src/app/(legal)/cookie-policy/page.mdx`
- **Privacy Policy**: `src/app/(legal)/privacy-policy/page.mdx`
- **Terms of Service**: `src/app/(legal)/terms-of-service/page.mdx`
- **Layout**: `src/app/(legal)/layout.tsx`

### Steps to Customize

1. **Locate the Files**:
   Navigate to `src/app/(legal)/` in your Zap.ts project.

2. **Edit the MDX Files**:
   Open any of the `page.mdx` files. Replace the placeholder Latin text ("Lorem Ipsum") with your actual legal content. For example, in `cookie-policy/page.mdx`:

   ```mdx
   export const metadata = {
     title: "Cookie Policy | YourApp",
     description: "Learn how we use cookies on our website.",
   };

   # Cookie Policy

   **Last Updated: March 21, 2025**

   We use cookies to improve your experience on our site. This policy explains how we collect and use cookie data...
   ```
