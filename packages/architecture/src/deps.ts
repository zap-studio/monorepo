export type DependencyGroup = {
  label: string;
  dependencies: string[];
};

export const ClassicDeps: DependencyGroup = {
  label: 'Classic Dependencies',
  dependencies: ['next', 'react', 'react-dom', 'tailwindcss'],
};

export const ZapDeps: DependencyGroup = {
  label: 'Zap.ts Additional Dependencies',
  dependencies: [
    "@zap-ts/architecture",
    '@ai-sdk/openai',
    '@ai-sdk/mistral',
    '@ai-sdk/react',
    '@bprogress/next',
    '@flags-sdk/posthog',
    '@hookform/resolvers',
    '@mdx-js/loader',
    '@mdx-js/react',
    '@neondatabase/serverless',
    '@next/bundle-analyzer',
    '@orpc/client',
    '@orpc/react-query',
    '@orpc/server',
    '@polar-sh/better-auth',
    '@polar-sh/sdk',
    '@react-email/components',
    '@tanstack/react-query',
    '@tanstack/react-query-devtools',
    '@types/mdx',
    '@vercel/analytics',
    '@vercel/speed-insights',
    'ai',
    'better-auth',
    'class-variance-authority',
    'client-only',
    'clsx',
    'cmdk',
    'date-fns',
    'dotenv',
    'drizzle-orm',
    'embla-carousel-react',
    'flags',
    'gray-matter',
    'input-otp',
    'lucide-react',
    'motion',
    'next-mdx-remote',
    'next-sitemap',
    'next-themes',
    'nuqs',
    'pg',
    'posthog-js',
    'posthog-node',
    'radix-ui',
    'react-day-picker',
    'react-email',
    'react-hook-form',
    'react-resizable-panels',
    'react-syntax-highlighter',
    'recharts',
    'resend',
    'schema-dts',
    'serialize-javascript',
    'server-only',
    'sonner',
    'tailwind-merge',
    'tailwindcss-animate',
    'vaul',
    'web-push',
    'zod',
    'zustand',
  ],
};

export const ClassicDevDeps: DependencyGroup = {
  label: 'Classic Dev Dependencies',
  dependencies: ['@biomejs/biome', '@tailwindcss/postcss', 'typescript'],
};

export const ZapDevDeps: DependencyGroup = {
  label: 'Zap.ts Additional Dev Dependencies',
  dependencies: [
    '@react-email/preview-server',
    'create-zap-app',
    'cross-env',
    'drizzle-kit',
    'react-scan',
    'ultracite',
  ],
};
