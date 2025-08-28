export const ClassicDeps = {
  label: 'Classic Dependencies',
  dependencies: [
    { package: 'next', children: <>Next.js framework</> },
    { package: 'react', children: <>React library</> },
    { package: 'react-dom', children: <>React DOM library</> },
    { package: 'tailwindcss', children: <>Tailwind CSS framework</> },
  ],
} as const;

export const ZapDeps = {
  label: 'Zap.ts Additional Dependencies',
  dependencies: [
    { package: '@zap-ts/architecture', children: <>Zap.ts architecture</> },
    { package: '@ai-sdk/openai', children: <>OpenAI SDK</> },
    { package: '@ai-sdk/mistral', children: <>Mistral SDK</> },
    { package: '@ai-sdk/react', children: <>React SDK</> },
    { package: '@bprogress/next', children: <>Next.js Progress</> },
    { package: '@flags-sdk/posthog', children: <>PostHog SDK</> },
    {
      package: '@hookform/resolvers',
      children: <>React Hook Form Resolvers</>,
    },
    { package: '@mdx-js/loader', children: <>MDX Loader</> },
    { package: '@mdx-js/react', children: <>MDX React</> },
    {
      package: '@neondatabase/serverless',
      children: <>Neon Database Serverless</>,
    },
    {
      package: '@next/bundle-analyzer',
      children: <>Next.js Bundle Analyzer</>,
    },
    { package: '@orpc/client', children: <>ORPC Client</> },
    { package: '@orpc/react-query', children: <>ORPC React Query</> },
    { package: '@orpc/server', children: <>ORPC Server</> },
    { package: '@polar-sh/better-auth', children: <>BetterAuth</> },
    { package: '@polar-sh/sdk', children: <>Polar SDK</> },
    {
      package: '@react-email/components',
      children: <>React Email Components</>,
    },
    { package: '@tanstack/react-query', children: <>TanStack React Query</> },
    {
      package: '@tanstack/react-query-devtools',
      children: <>TanStack React Query DevTools</>,
    },
    { package: '@vercel/analytics', children: <>Vercel Analytics</> },
    { package: '@vercel/speed-insights', children: <>Vercel Speed Insights</> },
    { package: 'ai', children: <>AI</> },
    { package: 'better-auth', children: <>BetterAuth</> },
    {
      package: 'class-variance-authority',
      children: <>Class Variance Authority</>,
    },
    { package: 'client-only', children: <>Client Only</> },
    { package: 'clsx', children: <>clsx</> },
    { package: 'cmdk', children: <>cmdk</> },
    { package: 'date-fns', children: <>date-fns</> },
    { package: 'dotenv', children: <>dotenv</> },
    { package: 'drizzle-orm', children: <>drizzle-orm</> },
    { package: 'embla-carousel-react', children: <>embla-carousel-react</> },
    { package: 'flags', children: <>flags</> },
    { package: 'gray-matter', children: <>gray-matter</> },
    { package: 'input-otp', children: <>input-otp</> },
    { package: 'lucide-react', children: <>lucide-react</> },
    { package: 'motion', children: <>motion</> },
    { package: 'next-mdx-remote', children: <>next-mdx-remote</> },
    { package: 'next-sitemap', children: <>next-sitemap</> },
    { package: 'next-themes', children: <>next-themes</> },
    { package: 'nuqs', children: <>nuqs</> },
    { package: 'pg', children: <>pg</> },
    { package: 'posthog-js', children: <>posthog-js</> },
    { package: 'posthog-node', children: <>posthog-node</> },
    { package: 'radix-ui', children: <>radix-ui</> },
    { package: 'react-day-picker', children: <>react-day-picker</> },
    { package: 'react-email', children: <>react-email</> },
    { package: 'react-hook-form', children: <>react-hook-form</> },
    {
      package: 'react-resizable-panels',
      children: <>react-resizable-panels</>,
    },
    {
      package: 'react-syntax-highlighter',
      children: <>react-syntax-highlighter</>,
    },
    { package: 'recharts', children: <>recharts</> },
    { package: 'resend', children: <>resend</> },
    { package: 'schema-dts', children: <>schema-dts</> },
    { package: 'serialize-javascript', children: <>serialize-javascript</> },
    { package: 'server-only', children: <>server-only</> },
    { package: 'sonner', children: <>sonner</> },
    { package: 'tailwind-merge', children: <>tailwind-merge</> },
    { package: 'tailwindcss-animate', children: <>tailwindcss-animate</> },
    { package: 'vaul', children: <>vaul</> },
    { package: 'web-push', children: <>web-push</> },
    { package: 'zod', children: <>zod</> },
    { package: 'zustand', children: <>zustand</> },
  ],
} as const;

export const ClassicDevDeps = {
  label: 'Classic Dev Dependencies',
  dependencies: [
    { package: '@biomejs/biome', children: <>@biomejs/biome</> },
    { package: '@tailwindcss/postcss', children: <>@tailwindcss/postcss</> },
    { package: '@types/node', children: <>@types/node</> },
    { package: '@types/react', children: <>@types/react</> },
    { package: '@types/react-dom', children: <>@types/react-dom</> },
    { package: 'typescript', children: <>typescript</> },
  ],
} as const;

export const ZapDevDeps = {
  label: 'Zap.ts Additional Dev Dependencies',
  dependencies: [
    {
      package: '@react-email/preview-server',
      children: <>@react-email/preview-server</>,
    },
    { package: '@types/mdx', children: <>@types/mdx</> },
    { package: '@types/pg', children: <>@types/pg</> },
    {
      package: '@types/react-syntax-highlighter',
      children: <>@types/react-syntax-highlighter</>,
    },
    {
      package: '@types/serialize-javascript',
      children: <>@types/serialize-javascript</>,
    },
    { package: '@types/web-push', children: <>@types/web-push</> },
    { package: 'create-zap-app', children: <>create-zap-app</> },
    { package: 'cross-env', children: <>cross-env</> },
    { package: 'drizzle-kit', children: <>drizzle-kit</> },
    { package: 'react-scan', children: <>react-scan</> },
    { package: 'ultracite', children: <>ultracite</> },
  ],
} as const;

export const allDependencies = [
  ...ClassicDeps.dependencies,
  ...ZapDeps.dependencies,
  ...ClassicDevDeps.dependencies,
  ...ZapDevDeps.dependencies,
];

export const allPackages = [
  ...Object.values(ClassicDeps.dependencies).map((dep) => dep.package),
  ...Object.values(ZapDeps.dependencies).map((dep) => dep.package),
  ...Object.values(ClassicDevDeps.dependencies).map((dep) => dep.package),
  ...Object.values(ZapDevDeps.dependencies).map((dep) => dep.package),
];
