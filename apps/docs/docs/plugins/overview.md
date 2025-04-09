# Using Plugins to Customize Zap.ts

Zap.ts is highly modular, allowing you to select the features you want. Its core functionality is built on Next.js, Tailwind CSS, shadcn/ui, Better Auth, Zustand, and oRPC, while everything else is customizable. You’re required to pick at least one ORM (Drizzle or Prisma), but additional features are available as optional plugins.

## Required Choice: ORM

You must enable **one** of the following ORM plugins:

| Plugin    | Description         | Dependencies                              | Available |
| --------- | ------------------- | ----------------------------------------- | --------- |
| `drizzle` | Sets up Drizzle ORM | `drizzle-orm`, `@neondatabase/serverless` | ✅        |
| `prisma`  | Sets up Prisma ORM  | `prisma`                                  | ❌        |

:::tip
We recommend **Neon** as the default database for **Drizzle**. This is the database set up by default but you can replace it by another.
:::

## Optional Plugins

| Plugin            | Description                      | Dependencies                                                 | Available |
| ----------------- | -------------------------------- | ------------------------------------------------------------ | --------- |
| `admin-dashboard` | Adds an admin dashboard          | None                                                         | ❌        |
| `ai`              | Adds AI Vercel SDK               | `ai`, `@ai-sdk/react`, `@ai-sdk/openai`, `@ai-sdk/mistral`   | ✅        |
| `blog`            | Adds a blog with MDX support     | `@mdx-js/react`, `@mdx-js/loader`, `@next/mdx`, `@types/mdx` | ❌        |
| `pwa`             | Adds PWA with push notifications | `sw.js`, `manifest.ts`, `web-push`, `ky`                     | ✅        |

:::tip
**MDX Configuration**  
We keep the `@mdx-js/react`, `@mdx-js/loader`, `@next/mdx` and `@types/mdx` plugins installed even if you don't use the `blog` plugin. Therefore, you will have to remove the [MDX configuration](https://nextjs.org/docs/app/building-your-application/configuring/mdx) manually if you are sure you don't want to use it.

**What is Ky?**  
[`ky`](https://github.com/sindresorhus/ky) is a lightweight and modern HTTP client for browsers, built on `fetch`. It offers a cleaner API, automatic retries, request cancellation, JSON handling, and other convenient features—making it a great alternative to raw `fetch`.  
:::
