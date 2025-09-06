export const ClassicDeps = {
  label: "Classic Dependencies",
  dependencies: [
    {
      package: "next",
      description:
        "The core React framework for server-side rendering, routing, and static site generation.",
      link: "https://nextjs.org/docs",
    },
    {
      package: "react",
      description: "The foundational library for building user interfaces.",
      link: "https://react.dev",
    },
    {
      package: "react-dom",
      description: "Provides DOM-specific methods for rendering React apps.",
      link: "https://react.dev/reference/react-dom",
    },
    {
      package: "tailwindcss",
      description: "Utility-first CSS framework for rapid UI development.",
      link: "https://tailwindcss.com/docs",
    },
  ],
} as const;

export const ZapDeps = {
  label: "Zap.ts Additional Dependencies",
  dependencies: [
    {
      package: "@zap-ts/architecture",
      description: "Zap.ts modular architecture utilities and core tooling.",
      link: "https://zap-ts.zapstudio.dev/",
    },
    {
      package: "@ai-sdk/openai",
      description: "Integrates OpenAI models for AI-powered features.",
      link: "https://sdk.vercel.ai/docs",
    },
    {
      package: "@ai-sdk/mistral",
      description: "Integrates Mistral models for generative AI features.",
      link: "https://sdk.vercel.ai/docs",
    },
    {
      package: "@ai-sdk/react",
      description: "React bindings for the Vercel AI SDK.",
      link: "https://sdk.vercel.ai/docs",
    },
    {
      package: "@bprogress/next",
      description: "Progress bar integration for Next.js applications.",
      link: "https://bprogress.vercel.app/",
    },
    {
      package: "@flags-sdk/posthog",
      description: "Feature flags and analytics integration with PostHog.",
      link: "https://posthog.com/docs",
    },
    {
      package: "@hookform/resolvers",
      description:
        "Validation resolvers for integrating schemas with React Hook Form.",
      link: "https://react-hook-form.com/docs/useform/#resolver",
    },
    {
      package: "@mdx-js/loader",
      description: "Webpack loader for compiling MDX files.",
      link: "https://mdxjs.com/",
    },
    {
      package: "@mdx-js/react",
      description: "React bindings for MDX, enabling JSX inside Markdown.",
      link: "https://mdxjs.com/packages/react/",
    },
    {
      package: "@neondatabase/serverless",
      description: "Serverless PostgreSQL driver for scalable database access.",
      link: "https://neon.com/docs/introduction",
    },
    {
      package: "@next/bundle-analyzer",
      description: "Bundle analysis tool for Next.js apps.",
      link: "https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer",
    },
    {
      package: "@orpc/client",
      description: "oRPC client for typed remote procedure calls.",
      link: "https://orpc.unnoq.com/docs/getting-started",
    },
    {
      package: "@orpc/react-query",
      description: "oRPC integration with TanStack React Query.",
      link: "https://orpc.unnoq.com/docs/integrations/tanstack-query",
    },
    {
      package: "@orpc/server",
      description: "oRPC server utilities for type-safe APIs.",
      link: "https://orpc.unnoq.com/docs/getting-started",
    },
    {
      package: "@polar-sh/better-auth",
      description: "Authentication solution integrated with Polar.",
      link: "https://www.better-auth.com/docs/plugins/polar",
    },
    {
      package: "@polar-sh/sdk",
      description: "Polar SDK for payments and subscriptions.",
      link: "https://docs.polar.sh/introduction",
    },
    {
      package: "@react-email/components",
      description: "Prebuilt React components for building rich emails.",
      link: "https://react.email/docs/components/html",
    },
    {
      package: "@tanstack/react-query",
      description: "Powerful data fetching and caching for React.",
      link: "https://tanstack.com/query/latest",
    },
    {
      package: "@tanstack/react-query-devtools",
      description: "Developer tools for debugging React Query.",
      link: "https://tanstack.com/query/latest/docs/framework/react/devtools",
    },
    {
      package: "@vercel/analytics",
      description: "Analytics for Vercel-hosted applications.",
      link: "https://vercel.com/docs/analytics",
    },
    {
      package: "@vercel/speed-insights",
      description: "Performance monitoring for Vercel deployments.",
      link: "https://vercel.com/docs/speed-insights",
    },
    {
      package: "ai",
      description: "Vercel AI SDK for LLMs and generative AI features.",
      link: "https://sdk.vercel.ai/docs",
    },
    {
      package: "better-auth",
      description: "Authentication solution for modern applications.",
      link: "https://www.better-auth.com/docs/introduction",
    },
    {
      package: "class-variance-authority",
      description: "Utility for managing class names and variants in React.",
      link: "https://cva.style/docs",
    },
    {
      package: "client-only",
      description: "Next.js component ensuring client-only rendering.",
      link: "https://www.npmjs.com/package/client-only",
    },
    {
      package: "clsx",
      description: "Utility for conditional className construction.",
      link: "https://github.com/lukeed/clsx",
    },
    {
      package: "cmdk",
      description: "Accessible command menu component for React.",
      link: "https://cmdk.paco.me/",
    },
    {
      package: "date-fns",
      description: "Modern date utility library for JavaScript.",
      link: "https://date-fns.org",
    },
    {
      package: "dotenv",
      description: "Loads environment variables from .env files.",
      link: "https://www.dotenv.org/",
    },
    {
      package: "drizzle-orm",
      description:
        "TypeScript ORM for SQL databases with migrations and schema tools.",
      link: "https://orm.drizzle.team/docs/overview",
    },
    {
      package: "embla-carousel-react",
      description: "Lightweight carousel component for React.",
      link: "https://www.embla-carousel.com/",
    },
    {
      package: "flags",
      description: "Feature flagging and remote configuration library.",
      link: "https://flags-sdk.dev/",
    },
    {
      package: "gray-matter",
      description: "Parses front matter from Markdown files.",
      link: "https://github.com/jonschlinkert/gray-matter",
    },
    {
      package: "input-otp",
      description: "One-time password input component for React.",
      link: "https://input-otp.rodz.dev/",
    },
    {
      package: "lucide-react",
      description: "Beautifully simple React icon library.",
      link: "https://lucide.dev",
    },
    {
      package: "motion",
      description: "Animation library for React with simple APIs.",
      link: "https://motion.dev",
    },
    {
      package: "next-mdx-remote",
      description: "Remote MDX loader for Next.js pages.",
      link: "https://github.com/hashicorp/next-mdx-remote",
    },
    {
      package: "next-sitemap",
      description: "Automatic sitemap generation for Next.js apps.",
      link: "https://github.com/iamvishnusankar/next-sitemap",
    },
    {
      package: "next-themes",
      description: "Theme switching and dark mode for Next.js.",
      link: "https://github.com/pacocoursey/next-themes",
    },
    {
      package: "nuqs",
      description: "Type-safe state management with URL search params.",
      link: "https://nuqs.47ng.com/",
    },
    {
      package: "pg",
      description: "PostgreSQL client for Node.js.",
      link: "https://node-postgres.com",
    },
    {
      package: "posthog-js",
      description: "PostHog analytics SDK for web apps.",
      link: "https://posthog.com/docs/libraries/js",
    },
    {
      package: "posthog-node",
      description: "PostHog analytics SDK for Node.js.",
      link: "https://posthog.com/docs/libraries/node",
    },
    {
      package: "radix-ui",
      description: "Primitives for building accessible UI components.",
      link: "https://www.radix-ui.com/",
    },
    {
      package: "react-day-picker",
      description: "Flexible and accessible date picker for React.",
      link: "https://react-day-picker.js.org/",
    },
    {
      package: "react-email",
      description: "Framework for building and sending emails with React.",
      link: "https://react.email",
    },
    {
      package: "react-hook-form",
      description: "Performant form management library for React.",
      link: "https://react-hook-form.com",
    },
    {
      package: "react-resizable-panels",
      description: "Resizable panel components for React apps.",
      link: "https://react-resizable-panels.vercel.app/",
    },
    {
      package: "react-syntax-highlighter",
      description: "Syntax highlighting component for React code blocks.",
      link: "https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/",
    },
    {
      package: "recharts",
      description: "Declarative charting library for React.",
      link: "https://recharts.org/",
    },
    {
      package: "resend",
      description: "Transactional email sending service.",
      link: "https://resend.com",
    },
    {
      package: "schema-dts",
      description: "TypeScript definitions for schema.org JSON-LD.",
      link: "https://github.com/google/schema-dts",
    },
    {
      package: "serialize-javascript",
      description: "Securely serialize JavaScript for transfer.",
      link: "https://github.com/yahoo/serialize-javascript",
    },
    {
      package: "server-only",
      description: "Next.js component enforcing server-only rendering.",
      link: "https://www.npmjs.com/package/server-only",
    },
    {
      package: "sonner",
      description: "Minimal toast notification library for React.",
      link: "https://sonner.emilkowal.ski/",
    },
    {
      package: "tailwind-merge",
      description: "Utility for merging Tailwind CSS classes intelligently.",
      link: "https://github.com/dcastil/tailwind-merge",
    },
    {
      package: "tailwindcss-animate",
      description: "Animation utilities for Tailwind CSS projects.",
      link: "https://github.com/jamiebuilds/tailwindcss-animate",
    },
    {
      package: "vaul",
      description: "Accessible drawer component for React.",
      link: "https://vaul.emilkowal.ski/",
    },
    {
      package: "web-push",
      description: "Library for sending Web Push notifications.",
      link: "https://github.com/web-push-libs/web-push",
    },
    {
      package: "zod",
      description: "TypeScript-first schema validation library.",
      link: "https://zod.dev",
    },
    {
      package: "zustand",
      description: "Small, fast state management solution for React.",
      link: "https://zustand-demo.pmnd.rs/",
    },
  ],
} as const;

export const ClassicDevDeps = {
  label: "Classic Dev Dependencies",
  dependencies: [
    {
      package: "@biomejs/biome",
      description: "Fast linter and formatter for TypeScript and JavaScript.",
      link: "https://biomejs.dev",
    },
    {
      package: "@tailwindcss/postcss",
      description: "PostCSS plugin for integrating TailwindCSS.",
      link: "https://tailwindcss.com/docs/installation/using-postcss",
    },
    {
      package: "@types/node",
      description: "TypeScript type definitions for Node.js.",
      link: "https://www.npmjs.com/package/@types/node",
    },
    {
      package: "@types/react",
      description: "TypeScript type definitions for React.",
      link: "https://www.npmjs.com/package/@types/react",
    },
    {
      package: "@types/react-dom",
      description: "TypeScript type definitions for ReactDOM.",
      link: "https://www.npmjs.com/package/@types/react-dom",
    },
    {
      package: "typescript",
      description: "Type-safe JavaScript development language.",
      link: "https://www.typescriptlang.org/",
    },
  ],
} as const;

export const ZapDevDeps = {
  label: "Zap.ts Additional Dev Dependencies",
  dependencies: [
    {
      package: "@react-email/preview-server",
      description: "Development server for previewing React Email templates.",
      link: "https://react.email/docs/introduction",
    },
    {
      package: "@types/mdx",
      description: "TypeScript type definitions for MDX.",
      link: "https://www.npmjs.com/package/@types/mdx",
    },
    {
      package: "@types/pg",
      description: "TypeScript type definitions for pg (PostgreSQL).",
      link: "https://www.npmjs.com/package/@types/pg",
    },
    {
      package: "@types/react-syntax-highlighter",
      description: "TypeScript type definitions for react-syntax-highlighter.",
      link: "https://www.npmjs.com/package/@types/react-syntax-highlighter",
    },
    {
      package: "@types/serialize-javascript",
      description: "TypeScript type definitions for serialize-javascript.",
      link: "https://www.npmjs.com/package/@types/serialize-javascript",
    },
    {
      package: "@types/web-push",
      description: "TypeScript type definitions for web-push.",
      link: "https://www.npmjs.com/package/@types/web-push",
    },
    {
      package: "cross-env",
      description: "Run environment variables across platforms in scripts.",
      link: "https://github.com/kentcdodds/cross-env",
    },
    {
      package: "drizzle-kit",
      description: "CLI for Drizzle ORM migrations and schema generation.",
      link: "https://orm.drizzle.team/kit-docs",
    },
    {
      package: "react-scan",
      description: "Detects performance issues in React apps automatically.",
      link: "https://react-scan.com/",
    },
    {
      package: "ultracite",
      description: "AI-powered linter/formatter for collaborative coding.",
      link: "https://www.ultracite.ai/",
    },
  ],
} as const;

export const Dependencies = [
  ...ClassicDeps.dependencies,
  ...ZapDeps.dependencies,
  ...ClassicDevDeps.dependencies,
  ...ZapDevDeps.dependencies,
] as const satisfies readonly [
  ...typeof ClassicDeps.dependencies,
  ...typeof ZapDeps.dependencies,
  ...typeof ClassicDevDeps.dependencies,
  ...typeof ZapDevDeps.dependencies,
] satisfies readonly [
  {
    readonly package: "next";
    readonly description: "The core React framework for server-side rendering, routing, and static site generation.";
    readonly link: "https://nextjs.org/docs";
  },
  {
    readonly package: "react";
    readonly description: "The foundational library for building user interfaces.";
    readonly link: "https://react.dev";
  },
  {
    readonly package: "react-dom";
    readonly description: "Provides DOM-specific methods for rendering React apps.";
    readonly link: "https://react.dev/reference/react-dom";
  },
  {
    readonly package: "tailwindcss";
    readonly description: "Utility-first CSS framework for rapid UI development.";
    readonly link: "https://tailwindcss.com/docs";
  },
  {
    readonly package: "@zap-ts/architecture";
    readonly description: "Zap.ts modular architecture utilities and core tooling.";
    readonly link: "https://zap-ts.zapstudio.dev/";
  },
  {
    readonly package: "@ai-sdk/openai";
    readonly description: "Integrates OpenAI models for AI-powered features.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "@ai-sdk/mistral";
    readonly description: "Integrates Mistral models for generative AI features.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "@ai-sdk/react";
    readonly description: "React bindings for the Vercel AI SDK.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "@bprogress/next";
    readonly description: "Progress bar integration for Next.js applications.";
    readonly link: "https://bprogress.vercel.app/";
  },
  {
    readonly package: "@flags-sdk/posthog";
    readonly description: "Feature flags and analytics integration with PostHog.";
    readonly link: "https://posthog.com/docs";
  },
  {
    readonly package: "@hookform/resolvers";
    readonly description: "Validation resolvers for integrating schemas with React Hook Form.";
    readonly link: "https://react-hook-form.com/docs/useform/#resolver";
  },
  {
    readonly package: "@mdx-js/loader";
    readonly description: "Webpack loader for compiling MDX files.";
    readonly link: "https://mdxjs.com/";
  },
  {
    readonly package: "@mdx-js/react";
    readonly description: "React bindings for MDX, enabling JSX inside Markdown.";
    readonly link: "https://mdxjs.com/packages/react/";
  },
  {
    readonly package: "@neondatabase/serverless";
    readonly description: "Serverless PostgreSQL driver for scalable database access.";
    readonly link: "https://neon.com/docs/introduction";
  },
  {
    readonly package: "@next/bundle-analyzer";
    readonly description: "Bundle analysis tool for Next.js apps.";
    readonly link: "https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer";
  },
  {
    readonly package: "@orpc/client";
    readonly description: "oRPC client for typed remote procedure calls.";
    readonly link: "https://orpc.unnoq.com/docs/getting-started";
  },
  {
    readonly package: "@orpc/react-query";
    readonly description: "oRPC integration with TanStack React Query.";
    readonly link: "https://orpc.unnoq.com/docs/integrations/tanstack-query";
  },
  {
    readonly package: "@orpc/server";
    readonly description: "oRPC server utilities for type-safe APIs.";
    readonly link: "https://orpc.unnoq.com/docs/getting-started";
  },
  {
    readonly package: "@polar-sh/better-auth";
    readonly description: "Authentication solution integrated with Polar.";
    readonly link: "https://www.better-auth.com/docs/plugins/polar";
  },
  {
    readonly package: "@polar-sh/sdk";
    readonly description: "Polar SDK for payments and subscriptions.";
    readonly link: "https://docs.polar.sh/introduction";
  },
  {
    readonly package: "@react-email/components";
    readonly description: "Prebuilt React components for building rich emails.";
    readonly link: "https://react.email/docs/components/html";
  },
  {
    readonly package: "@tanstack/react-query";
    readonly description: "Powerful data fetching and caching for React.";
    readonly link: "https://tanstack.com/query/latest";
  },
  {
    readonly package: "@tanstack/react-query-devtools";
    readonly description: "Developer tools for debugging React Query.";
    readonly link: "https://tanstack.com/query/latest/docs/framework/react/devtools";
  },
  {
    readonly package: "@vercel/analytics";
    readonly description: "Analytics for Vercel-hosted applications.";
    readonly link: "https://vercel.com/docs/analytics";
  },
  {
    readonly package: "@vercel/speed-insights";
    readonly description: "Performance monitoring for Vercel deployments.";
    readonly link: "https://vercel.com/docs/speed-insights";
  },
  {
    readonly package: "ai";
    readonly description: "Vercel AI SDK for LLMs and generative AI features.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "better-auth";
    readonly description: "Authentication solution for modern applications.";
    readonly link: "https://www.better-auth.com/docs/introduction";
  },
  {
    readonly package: "class-variance-authority";
    readonly description: "Utility for managing class names and variants in React.";
    readonly link: "https://cva.style/docs";
  },
  {
    readonly package: "client-only";
    readonly description: "Next.js component ensuring client-only rendering.";
    readonly link: "https://www.npmjs.com/package/client-only";
  },
  {
    readonly package: "clsx";
    readonly description: "Utility for conditional className construction.";
    readonly link: "https://github.com/lukeed/clsx";
  },
  {
    readonly package: "cmdk";
    readonly description: "Accessible command menu component for React.";
    readonly link: "https://cmdk.paco.me/";
  },
  {
    readonly package: "date-fns";
    readonly description: "Modern date utility library for JavaScript.";
    readonly link: "https://date-fns.org";
  },
  {
    readonly package: "dotenv";
    readonly description: "Loads environment variables from .env files.";
    readonly link: "https://www.dotenv.org/";
  },
  {
    readonly package: "drizzle-orm";
    readonly description: "TypeScript ORM for SQL databases with migrations and schema tools.";
    readonly link: "https://orm.drizzle.team/docs/overview";
  },
  {
    readonly package: "embla-carousel-react";
    readonly description: "Lightweight carousel component for React.";
    readonly link: "https://www.embla-carousel.com/";
  },
  {
    readonly package: "flags";
    readonly description: "Feature flagging and remote configuration library.";
    readonly link: "https://flags-sdk.dev/";
  },
  {
    readonly package: "gray-matter";
    readonly description: "Parses front matter from Markdown files.";
    readonly link: "https://github.com/jonschlinkert/gray-matter";
  },
  {
    readonly package: "input-otp";
    readonly description: "One-time password input component for React.";
    readonly link: "https://input-otp.rodz.dev/";
  },
  {
    readonly package: "lucide-react";
    readonly description: "Beautifully simple React icon library.";
    readonly link: "https://lucide.dev";
  },
  {
    readonly package: "motion";
    readonly description: "Animation library for React with simple APIs.";
    readonly link: "https://motion.dev";
  },
  {
    readonly package: "next-mdx-remote";
    readonly description: "Remote MDX loader for Next.js pages.";
    readonly link: "https://github.com/hashicorp/next-mdx-remote";
  },
  {
    readonly package: "next-sitemap";
    readonly description: "Automatic sitemap generation for Next.js apps.";
    readonly link: "https://github.com/iamvishnusankar/next-sitemap";
  },
  {
    readonly package: "next-themes";
    readonly description: "Theme switching and dark mode for Next.js.";
    readonly link: "https://github.com/pacocoursey/next-themes";
  },
  {
    readonly package: "nuqs";
    readonly description: "Type-safe state management with URL search params.";
    readonly link: "https://nuqs.47ng.com/";
  },
  {
    readonly package: "pg";
    readonly description: "PostgreSQL client for Node.js.";
    readonly link: "https://node-postgres.com";
  },
  {
    readonly package: "posthog-js";
    readonly description: "PostHog analytics SDK for web apps.";
    readonly link: "https://posthog.com/docs/libraries/js";
  },
  {
    readonly package: "posthog-node";
    readonly description: "PostHog analytics SDK for Node.js.";
    readonly link: "https://posthog.com/docs/libraries/node";
  },
  {
    readonly package: "radix-ui";
    readonly description: "Primitives for building accessible UI components.";
    readonly link: "https://www.radix-ui.com/";
  },
  {
    readonly package: "react-day-picker";
    readonly description: "Flexible and accessible date picker for React.";
    readonly link: "https://react-day-picker.js.org/";
  },
  {
    readonly package: "react-email";
    readonly description: "Framework for building and sending emails with React.";
    readonly link: "https://react.email";
  },
  {
    readonly package: "react-hook-form";
    readonly description: "Performant form management library for React.";
    readonly link: "https://react-hook-form.com";
  },
  {
    readonly package: "react-resizable-panels";
    readonly description: "Resizable panel components for React apps.";
    readonly link: "https://react-resizable-panels.vercel.app/";
  },
  {
    readonly package: "react-syntax-highlighter";
    readonly description: "Syntax highlighting component for React code blocks.";
    readonly link: "https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/";
  },
  {
    readonly package: "recharts";
    readonly description: "Declarative charting library for React.";
    readonly link: "https://recharts.org/";
  },
  {
    readonly package: "resend";
    readonly description: "Transactional email sending service.";
    readonly link: "https://resend.com";
  },
  {
    readonly package: "schema-dts";
    readonly description: "TypeScript definitions for schema.org JSON-LD.";
    readonly link: "https://github.com/google/schema-dts";
  },
  {
    readonly package: "serialize-javascript";
    readonly description: "Securely serialize JavaScript for transfer.";
    readonly link: "https://github.com/yahoo/serialize-javascript";
  },
  {
    readonly package: "server-only";
    readonly description: "Next.js component enforcing server-only rendering.";
    readonly link: "https://www.npmjs.com/package/server-only";
  },
  {
    readonly package: "sonner";
    readonly description: "Minimal toast notification library for React.";
    readonly link: "https://sonner.emilkowal.ski/";
  },
  {
    readonly package: "tailwind-merge";
    readonly description: "Utility for merging Tailwind CSS classes intelligently.";
    readonly link: "https://github.com/dcastil/tailwind-merge";
  },
  {
    readonly package: "tailwindcss-animate";
    readonly description: "Animation utilities for Tailwind CSS projects.";
    readonly link: "https://github.com/jamiebuilds/tailwindcss-animate";
  },
  {
    readonly package: "vaul";
    readonly description: "Accessible drawer component for React.";
    readonly link: "https://vaul.emilkowal.ski/";
  },
  {
    readonly package: "web-push";
    readonly description: "Library for sending Web Push notifications.";
    readonly link: "https://github.com/web-push-libs/web-push";
  },
  {
    readonly package: "zod";
    readonly description: "TypeScript-first schema validation library.";
    readonly link: "https://zod.dev";
  },
  {
    readonly package: "zustand";
    readonly description: "Small, fast state management solution for React.";
    readonly link: "https://zustand-demo.pmnd.rs/";
  },
  {
    readonly package: "@biomejs/biome";
    readonly description: "Fast linter and formatter for TypeScript and JavaScript.";
    readonly link: "https://biomejs.dev";
  },
  {
    readonly package: "@tailwindcss/postcss";
    readonly description: "PostCSS plugin for integrating TailwindCSS.";
    readonly link: "https://tailwindcss.com/docs/installation/using-postcss";
  },
  {
    readonly package: "@types/node";
    readonly description: "TypeScript type definitions for Node.js.";
    readonly link: "https://www.npmjs.com/package/@types/node";
  },
  {
    readonly package: "@types/react";
    readonly description: "TypeScript type definitions for React.";
    readonly link: "https://www.npmjs.com/package/@types/react";
  },
  {
    readonly package: "@types/react-dom";
    readonly description: "TypeScript type definitions for ReactDOM.";
    readonly link: "https://www.npmjs.com/package/@types/react-dom";
  },
  {
    readonly package: "typescript";
    readonly description: "Type-safe JavaScript development language.";
    readonly link: "https://www.typescriptlang.org/";
  },
  {
    readonly package: "@react-email/preview-server";
    readonly description: "Development server for previewing React Email templates.";
    readonly link: "https://react.email/docs/introduction";
  },
  {
    readonly package: "@types/mdx";
    readonly description: "TypeScript type definitions for MDX.";
    readonly link: "https://www.npmjs.com/package/@types/mdx";
  },
  {
    readonly package: "@types/pg";
    readonly description: "TypeScript type definitions for pg (PostgreSQL).";
    readonly link: "https://www.npmjs.com/package/@types/pg";
  },
  {
    readonly package: "@types/react-syntax-highlighter";
    readonly description: "TypeScript type definitions for react-syntax-highlighter.";
    readonly link: "https://www.npmjs.com/package/@types/react-syntax-highlighter";
  },
  {
    readonly package: "@types/serialize-javascript";
    readonly description: "TypeScript type definitions for serialize-javascript.";
    readonly link: "https://www.npmjs.com/package/@types/serialize-javascript";
  },
  {
    readonly package: "@types/web-push";
    readonly description: "TypeScript type definitions for web-push.";
    readonly link: "https://www.npmjs.com/package/@types/web-push";
  },
  {
    readonly package: "cross-env";
    readonly description: "Run environment variables across platforms in scripts.";
    readonly link: "https://github.com/kentcdodds/cross-env";
  },
  {
    readonly package: "drizzle-kit";
    readonly description: "CLI for Drizzle ORM migrations and schema generation.";
    readonly link: "https://orm.drizzle.team/kit-docs";
  },
  {
    readonly package: "react-scan";
    readonly description: "Detects performance issues in React apps automatically.";
    readonly link: "https://react-scan.com/";
  },
  {
    readonly package: "ultracite";
    readonly description: "AI-powered linter/formatter for collaborative coding.";
    readonly link: "https://www.ultracite.ai/";
  },
] as readonly [
  {
    readonly package: "next";
    readonly description: "The core React framework for server-side rendering, routing, and static site generation.";
    readonly link: "https://nextjs.org/docs";
  },
  {
    readonly package: "react";
    readonly description: "The foundational library for building user interfaces.";
    readonly link: "https://react.dev";
  },
  {
    readonly package: "react-dom";
    readonly description: "Provides DOM-specific methods for rendering React apps.";
    readonly link: "https://react.dev/reference/react-dom";
  },
  {
    readonly package: "tailwindcss";
    readonly description: "Utility-first CSS framework for rapid UI development.";
    readonly link: "https://tailwindcss.com/docs";
  },
  {
    readonly package: "@zap-ts/architecture";
    readonly description: "Zap.ts modular architecture utilities and core tooling.";
    readonly link: "https://zap-ts.zapstudio.dev/";
  },
  {
    readonly package: "@ai-sdk/openai";
    readonly description: "Integrates OpenAI models for AI-powered features.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "@ai-sdk/mistral";
    readonly description: "Integrates Mistral models for generative AI features.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "@ai-sdk/react";
    readonly description: "React bindings for the Vercel AI SDK.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "@bprogress/next";
    readonly description: "Progress bar integration for Next.js applications.";
    readonly link: "https://bprogress.vercel.app/";
  },
  {
    readonly package: "@flags-sdk/posthog";
    readonly description: "Feature flags and analytics integration with PostHog.";
    readonly link: "https://posthog.com/docs";
  },
  {
    readonly package: "@hookform/resolvers";
    readonly description: "Validation resolvers for integrating schemas with React Hook Form.";
    readonly link: "https://react-hook-form.com/docs/useform/#resolver";
  },
  {
    readonly package: "@mdx-js/loader";
    readonly description: "Webpack loader for compiling MDX files.";
    readonly link: "https://mdxjs.com/";
  },
  {
    readonly package: "@mdx-js/react";
    readonly description: "React bindings for MDX, enabling JSX inside Markdown.";
    readonly link: "https://mdxjs.com/packages/react/";
  },
  {
    readonly package: "@neondatabase/serverless";
    readonly description: "Serverless PostgreSQL driver for scalable database access.";
    readonly link: "https://neon.com/docs/introduction";
  },
  {
    readonly package: "@next/bundle-analyzer";
    readonly description: "Bundle analysis tool for Next.js apps.";
    readonly link: "https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer";
  },
  {
    readonly package: "@orpc/client";
    readonly description: "oRPC client for typed remote procedure calls.";
    readonly link: "https://orpc.unnoq.com/docs/getting-started";
  },
  {
    readonly package: "@orpc/react-query";
    readonly description: "oRPC integration with TanStack React Query.";
    readonly link: "https://orpc.unnoq.com/docs/integrations/tanstack-query";
  },
  {
    readonly package: "@orpc/server";
    readonly description: "oRPC server utilities for type-safe APIs.";
    readonly link: "https://orpc.unnoq.com/docs/getting-started";
  },
  {
    readonly package: "@polar-sh/better-auth";
    readonly description: "Authentication solution integrated with Polar.";
    readonly link: "https://www.better-auth.com/docs/plugins/polar";
  },
  {
    readonly package: "@polar-sh/sdk";
    readonly description: "Polar SDK for payments and subscriptions.";
    readonly link: "https://docs.polar.sh/introduction";
  },
  {
    readonly package: "@react-email/components";
    readonly description: "Prebuilt React components for building rich emails.";
    readonly link: "https://react.email/docs/components/html";
  },
  {
    readonly package: "@tanstack/react-query";
    readonly description: "Powerful data fetching and caching for React.";
    readonly link: "https://tanstack.com/query/latest";
  },
  {
    readonly package: "@tanstack/react-query-devtools";
    readonly description: "Developer tools for debugging React Query.";
    readonly link: "https://tanstack.com/query/latest/docs/framework/react/devtools";
  },
  {
    readonly package: "@vercel/analytics";
    readonly description: "Analytics for Vercel-hosted applications.";
    readonly link: "https://vercel.com/docs/analytics";
  },
  {
    readonly package: "@vercel/speed-insights";
    readonly description: "Performance monitoring for Vercel deployments.";
    readonly link: "https://vercel.com/docs/speed-insights";
  },
  {
    readonly package: "ai";
    readonly description: "Vercel AI SDK for LLMs and generative AI features.";
    readonly link: "https://sdk.vercel.ai/docs";
  },
  {
    readonly package: "better-auth";
    readonly description: "Authentication solution for modern applications.";
    readonly link: "https://www.better-auth.com/docs/introduction";
  },
  {
    readonly package: "class-variance-authority";
    readonly description: "Utility for managing class names and variants in React.";
    readonly link: "https://cva.style/docs";
  },
  {
    readonly package: "client-only";
    readonly description: "Next.js component ensuring client-only rendering.";
    readonly link: "https://www.npmjs.com/package/client-only";
  },
  {
    readonly package: "clsx";
    readonly description: "Utility for conditional className construction.";
    readonly link: "https://github.com/lukeed/clsx";
  },
  {
    readonly package: "cmdk";
    readonly description: "Accessible command menu component for React.";
    readonly link: "https://cmdk.paco.me/";
  },
  {
    readonly package: "date-fns";
    readonly description: "Modern date utility library for JavaScript.";
    readonly link: "https://date-fns.org";
  },
  {
    readonly package: "dotenv";
    readonly description: "Loads environment variables from .env files.";
    readonly link: "https://www.dotenv.org/";
  },
  {
    readonly package: "drizzle-orm";
    readonly description: "TypeScript ORM for SQL databases with migrations and schema tools.";
    readonly link: "https://orm.drizzle.team/docs/overview";
  },
  {
    readonly package: "embla-carousel-react";
    readonly description: "Lightweight carousel component for React.";
    readonly link: "https://www.embla-carousel.com/";
  },
  {
    readonly package: "flags";
    readonly description: "Feature flagging and remote configuration library.";
    readonly link: "https://flags-sdk.dev/";
  },
  {
    readonly package: "gray-matter";
    readonly description: "Parses front matter from Markdown files.";
    readonly link: "https://github.com/jonschlinkert/gray-matter";
  },
  {
    readonly package: "input-otp";
    readonly description: "One-time password input component for React.";
    readonly link: "https://input-otp.rodz.dev/";
  },
  {
    readonly package: "lucide-react";
    readonly description: "Beautifully simple React icon library.";
    readonly link: "https://lucide.dev";
  },
  {
    readonly package: "motion";
    readonly description: "Animation library for React with simple APIs.";
    readonly link: "https://motion.dev";
  },
  {
    readonly package: "next-mdx-remote";
    readonly description: "Remote MDX loader for Next.js pages.";
    readonly link: "https://github.com/hashicorp/next-mdx-remote";
  },
  {
    readonly package: "next-sitemap";
    readonly description: "Automatic sitemap generation for Next.js apps.";
    readonly link: "https://github.com/iamvishnusankar/next-sitemap";
  },
  {
    readonly package: "next-themes";
    readonly description: "Theme switching and dark mode for Next.js.";
    readonly link: "https://github.com/pacocoursey/next-themes";
  },
  {
    readonly package: "nuqs";
    readonly description: "Type-safe state management with URL search params.";
    readonly link: "https://nuqs.47ng.com/";
  },
  {
    readonly package: "pg";
    readonly description: "PostgreSQL client for Node.js.";
    readonly link: "https://node-postgres.com";
  },
  {
    readonly package: "posthog-js";
    readonly description: "PostHog analytics SDK for web apps.";
    readonly link: "https://posthog.com/docs/libraries/js";
  },
  {
    readonly package: "posthog-node";
    readonly description: "PostHog analytics SDK for Node.js.";
    readonly link: "https://posthog.com/docs/libraries/node";
  },
  {
    readonly package: "radix-ui";
    readonly description: "Primitives for building accessible UI components.";
    readonly link: "https://www.radix-ui.com/";
  },
  {
    readonly package: "react-day-picker";
    readonly description: "Flexible and accessible date picker for React.";
    readonly link: "https://react-day-picker.js.org/";
  },
  {
    readonly package: "react-email";
    readonly description: "Framework for building and sending emails with React.";
    readonly link: "https://react.email";
  },
  {
    readonly package: "react-hook-form";
    readonly description: "Performant form management library for React.";
    readonly link: "https://react-hook-form.com";
  },
  {
    readonly package: "react-resizable-panels";
    readonly description: "Resizable panel components for React apps.";
    readonly link: "https://react-resizable-panels.vercel.app/";
  },
  {
    readonly package: "react-syntax-highlighter";
    readonly description: "Syntax highlighting component for React code blocks.";
    readonly link: "https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/";
  },
  {
    readonly package: "recharts";
    readonly description: "Declarative charting library for React.";
    readonly link: "https://recharts.org/";
  },
  {
    readonly package: "resend";
    readonly description: "Transactional email sending service.";
    readonly link: "https://resend.com";
  },
  {
    readonly package: "schema-dts";
    readonly description: "TypeScript definitions for schema.org JSON-LD.";
    readonly link: "https://github.com/google/schema-dts";
  },
  {
    readonly package: "serialize-javascript";
    readonly description: "Securely serialize JavaScript for transfer.";
    readonly link: "https://github.com/yahoo/serialize-javascript";
  },
  {
    readonly package: "server-only";
    readonly description: "Next.js component enforcing server-only rendering.";
    readonly link: "https://www.npmjs.com/package/server-only";
  },
  {
    readonly package: "sonner";
    readonly description: "Minimal toast notification library for React.";
    readonly link: "https://sonner.emilkowal.ski/";
  },
  {
    readonly package: "tailwind-merge";
    readonly description: "Utility for merging Tailwind CSS classes intelligently.";
    readonly link: "https://github.com/dcastil/tailwind-merge";
  },
  {
    readonly package: "tailwindcss-animate";
    readonly description: "Animation utilities for Tailwind CSS projects.";
    readonly link: "https://github.com/jamiebuilds/tailwindcss-animate";
  },
  {
    readonly package: "vaul";
    readonly description: "Accessible drawer component for React.";
    readonly link: "https://vaul.emilkowal.ski/";
  },
  {
    readonly package: "web-push";
    readonly description: "Library for sending Web Push notifications.";
    readonly link: "https://github.com/web-push-libs/web-push";
  },
  {
    readonly package: "zod";
    readonly description: "TypeScript-first schema validation library.";
    readonly link: "https://zod.dev";
  },
  {
    readonly package: "zustand";
    readonly description: "Small, fast state management solution for React.";
    readonly link: "https://zustand-demo.pmnd.rs/";
  },
  {
    readonly package: "@biomejs/biome";
    readonly description: "Fast linter and formatter for TypeScript and JavaScript.";
    readonly link: "https://biomejs.dev";
  },
  {
    readonly package: "@tailwindcss/postcss";
    readonly description: "PostCSS plugin for integrating TailwindCSS.";
    readonly link: "https://tailwindcss.com/docs/installation/using-postcss";
  },
  {
    readonly package: "@types/node";
    readonly description: "TypeScript type definitions for Node.js.";
    readonly link: "https://www.npmjs.com/package/@types/node";
  },
  {
    readonly package: "@types/react";
    readonly description: "TypeScript type definitions for React.";
    readonly link: "https://www.npmjs.com/package/@types/react";
  },
  {
    readonly package: "@types/react-dom";
    readonly description: "TypeScript type definitions for ReactDOM.";
    readonly link: "https://www.npmjs.com/package/@types/react-dom";
  },
  {
    readonly package: "typescript";
    readonly description: "Type-safe JavaScript development language.";
    readonly link: "https://www.typescriptlang.org/";
  },
  {
    readonly package: "@react-email/preview-server";
    readonly description: "Development server for previewing React Email templates.";
    readonly link: "https://react.email/docs/introduction";
  },
  {
    readonly package: "@types/mdx";
    readonly description: "TypeScript type definitions for MDX.";
    readonly link: "https://www.npmjs.com/package/@types/mdx";
  },
  {
    readonly package: "@types/pg";
    readonly description: "TypeScript type definitions for pg (PostgreSQL).";
    readonly link: "https://www.npmjs.com/package/@types/pg";
  },
  {
    readonly package: "@types/react-syntax-highlighter";
    readonly description: "TypeScript type definitions for react-syntax-highlighter.";
    readonly link: "https://www.npmjs.com/package/@types/react-syntax-highlighter";
  },
  {
    readonly package: "@types/serialize-javascript";
    readonly description: "TypeScript type definitions for serialize-javascript.";
    readonly link: "https://www.npmjs.com/package/@types/serialize-javascript";
  },
  {
    readonly package: "@types/web-push";
    readonly description: "TypeScript type definitions for web-push.";
    readonly link: "https://www.npmjs.com/package/@types/web-push";
  },
  {
    readonly package: "cross-env";
    readonly description: "Run environment variables across platforms in scripts.";
    readonly link: "https://github.com/kentcdodds/cross-env";
  },
  {
    readonly package: "drizzle-kit";
    readonly description: "CLI for Drizzle ORM migrations and schema generation.";
    readonly link: "https://orm.drizzle.team/kit-docs";
  },
  {
    readonly package: "react-scan";
    readonly description: "Detects performance issues in React apps automatically.";
    readonly link: "https://react-scan.com/";
  },
  {
    readonly package: "ultracite";
    readonly description: "AI-powered linter/formatter for collaborative coding.";
    readonly link: "https://www.ultracite.ai/";
  },
];

export const Packages: readonly (
  | "@types/serialize-javascript"
  | "@types/web-push"
  | "cross-env"
  | "drizzle-kit"
  | "react-scan"
  | "ultracite"
  | "next"
  | "react"
  | "react-dom"
  | "tailwindcss"
  | "@zap-ts/architecture"
  | "@ai-sdk/openai"
  | "@ai-sdk/mistral"
  | "@ai-sdk/react"
  | "@bprogress/next"
  | "@flags-sdk/posthog"
  | "@hookform/resolvers"
  | "@mdx-js/loader"
  | "@mdx-js/react"
  | "@neondatabase/serverless"
  | "@next/bundle-analyzer"
  | "@orpc/client"
  | "@orpc/react-query"
  | "@orpc/server"
  | "@polar-sh/better-auth"
  | "@polar-sh/sdk"
  | "@react-email/components"
  | "@tanstack/react-query"
  | "@tanstack/react-query-devtools"
  | "@vercel/analytics"
  | "@vercel/speed-insights"
  | "ai"
  | "better-auth"
  | "class-variance-authority"
  | "client-only"
  | "clsx"
  | "cmdk"
  | "date-fns"
  | "dotenv"
  | "drizzle-orm"
  | "embla-carousel-react"
  | "flags"
  | "gray-matter"
  | "input-otp"
  | "lucide-react"
  | "motion"
  | "next-mdx-remote"
  | "next-sitemap"
  | "next-themes"
  | "nuqs"
  | "pg"
  | "posthog-js"
  | "posthog-node"
  | "radix-ui"
  | "react-day-picker"
  | "react-email"
  | "react-hook-form"
  | "react-resizable-panels"
  | "react-syntax-highlighter"
  | "recharts"
  | "resend"
  | "schema-dts"
  | "serialize-javascript"
  | "server-only"
  | "sonner"
  | "tailwind-merge"
  | "tailwindcss-animate"
  | "vaul"
  | "web-push"
  | "zod"
  | "zustand"
  | "@biomejs/biome"
  | "@tailwindcss/postcss"
  | "@types/node"
  | "@types/react"
  | "@types/react-dom"
  | "typescript"
  | "@react-email/preview-server"
  | "@types/mdx"
  | "@types/pg"
  | "@types/react-syntax-highlighter"
)[] = [
  ...Object.values(ClassicDeps.dependencies).map((dep) => dep.package),
  ...Object.values(ZapDeps.dependencies).map((dep) => dep.package),
  ...Object.values(ClassicDevDeps.dependencies).map((dep) => dep.package),
  ...Object.values(ZapDevDeps.dependencies).map((dep) => dep.package),
] as const;
