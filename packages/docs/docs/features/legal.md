# Legal Templates

The `legal` plugin adds template pages for your Privacy Policy, Cookie Policy, and Terms of Service. These pages are written in MDX (Markdown with JSX) and use placeholder text in Latin ("Lorem Ipsum"). You can customize them to fit your app’s needs.

## How It Works

When you enable the `legal` plugin with `npx create-zap-app@latest`:

- It copies the template pages to your app:
  - `src/app/privacy-policy/page.mdx` (for `/privacy-policy`)
  - `src/app/cookie-policy/page.mdx` (for `/cookie-policy`)
  - `src/app/terms-of-service/page.mdx` (for `/terms-of-service`)
- It installs (if not already) dependencies needed for MDX: `@mdx-js/react`, `@mdx-js/loader`, `@next/mdx`, and `@types/mdx`.

## Customize the Templates

1. Open the `.mdx` files in `src/app/privacy-policy/`, `src/app/cookie-policy/`, and `src/app/terms-of-service/`.
2. Replace the placeholder text (Lorem Ipsum) with your own details. For example, in the Privacy Policy, explain what data you collect and how you use it.
3. Add your contact information in the "Contact Us" sections.
4. Talk to a lawyer to make sure your policies follow the laws in your country (like GDPR in the EU).
5. Add links to these pages in your app’s footer or navigation bar.
