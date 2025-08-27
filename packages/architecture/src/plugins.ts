// TODO: review data and add which plugins depend on each other
export const Plugins = {
  ai: {
    id: 'ai',
    label: 'AI',
    description: 'Integrates AI SDKs such as OpenAI and Mistral.',
    dependencies: ['ai', '@ai-sdk/openai', '@ai-sdk/mistral', '@ai-sdk/react'],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    description: 'Adds analytics providers like Vercel, PostHog, etc.',
    dependencies: [
      '@vercel/analytics',
      '@vercel/speed-insights',
      'posthog-js',
      'posthog-node',
    ],
  },
  api: {
    id: 'api',
    label: 'API',
    description: 'Typed RPC API using oRPC.',
    dependencies: ['@orpc/client', '@orpc/server', '@orpc/react-query'],
  },
  auth: {
    id: 'auth',
    label: 'Authentication',
    description: 'Authentication with Better Auth.',
    dependencies: ['better-auth', '@polar-sh/better-auth', '@polar-sh/sdk'],
  },
  blog: {
    id: 'blog',
    label: 'Blog',
    description: 'Static/dynamic blog with MDX support.',
    dependencies: [
      'next-mdx-remote',
      'gray-matter',
      '@mdx-js/react',
      '@mdx-js/loader',
    ],
  },
  components: {
    id: 'components',
    label: 'Components',
    description: 'Extra UI hooks and utilities for shadcn/ui.',
    dependencies: ['clsx', 'tailwind-merge', 'class-variance-authority'],
  },
  crypto: {
    id: 'crypto',
    label: 'Crypto',
    description: 'Cryptographic helpers and utilities.',
    dependencies: [],
  },
  db: {
    id: 'db',
    label: 'Database',
    description: 'Database integration via Drizzle ORM & PostgreSQL.',
    dependencies: ['drizzle-orm', 'pg', '@neondatabase/serverless'],
    devDependencies: ['drizzle-kit'],
  },
  env: {
    id: 'env',
    label: 'Environment',
    description: 'Environment management via dotenv.',
    dependencies: ['dotenv'],
  },
  errors: {
    id: 'errors',
    label: 'Error Handling',
    description: 'Error boundary & toast system.',
    dependencies: ['sonner', 'zod'],
  },
  feedbacks: {
    id: 'feedbacks',
    label: 'Feedback',
    description: 'Collect feedback from users.',
    dependencies: [],
  },
  flags: {
    id: 'flags',
    label: 'Feature Flags',
    description: 'Feature flagging with Flags SDK + PostHog.',
    dependencies: ['flags', '@flags-sdk/posthog'],
  },
  landing: {
    id: 'landing',
    label: 'Landing',
    description: 'Public landing page template.',
    dependencies: [],
  },
  legal: {
    id: 'legal',
    label: 'Legal',
    description: 'Cookie, privacy, terms of service pages.',
    dependencies: [],
  },
  mails: {
    id: 'mails',
    label: 'Emails',
    description: 'Email templates with React Email & Resend.',
    dependencies: ['@react-email/components', 'react-email', 'resend'],
    devDependencies: ['@react-email/preview-server'],
  },
  markdown: {
    id: 'markdown',
    label: 'Markdown',
    description: 'Markdown rendering with syntax highlighting.',
    dependencies: ['react-syntax-highlighter', 'gray-matter'],
  },
  payments: {
    id: 'payments',
    label: 'Payments',
    description: 'Billing & payments with Polar SDK.',
    dependencies: ['@polar-sh/sdk', '@polar-sh/better-auth'],
  },
  plugins: {
    id: 'plugins',
    label: 'Plugins',
    description: 'Zap.ts plugin system bootstrap.',
    dependencies: [],
  },
  pwa: {
    id: 'pwa',
    label: 'Progressive Web App',
    description: 'Service worker, manifest, push notifications.',
    dependencies: ['web-push'],
  },
  sidebar: {
    id: 'sidebar',
    label: 'Sidebar Layout',
    description: 'Authenticated app layout with sidebar.',
    dependencies: [],
  },
  waitlist: {
    id: 'waitlist',
    label: 'Waitlist',
    description: 'Waitlist page + middleware integration.',
    dependencies: [],
  },
} as const;

export type PluginId = keyof typeof Plugins;
export type Plugin = (typeof Plugins)[PluginId];
