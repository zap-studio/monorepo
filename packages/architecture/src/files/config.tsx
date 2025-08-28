import { Categories } from '../categories';
import type { FileList } from '../types';

export const ConfigFiles: FileList = {
  category: Categories.CONFIG,
  entries: [
    {
      path: 'biome.json',
      status: 'added',
      required: false,
      children: (
        <>
          Configuration for [Biome](https://biomejs.dev/) linter and formatter
          to ensure code quality and consistency.
        </>
      ),
    },
    {
      path: 'tsconfig.json',
      status: 'added',
      required: true,
      children: (
        <>
          TypeScript configuration file for type safety and project structure.
        </>
      ),
    },
    {
      path: 'package.json',
      status: 'added',
      required: true,
      children: (
        <>
          Project manifest file specifying dependencies, scripts, and metadata
          for the application.
        </>
      ),
    },
    {
      path: 'bun.lock',
      status: 'added',
      required: false,
      children: (
        <>
          Lockfile for [Bun](https://bun.sh/) to ensure consistent dependency
          versions.
        </>
      ),
    },
    {
      path: 'turbo.json',
      status: 'added',
      required: false,
      children: (
        <>
          Configuration for [Turborepo](https://turbo.build/) to manage monorepo
          tasks and caching.
        </>
      ),
    },
    {
      path: 'next.config.ts',
      status: 'added',
      required: true,
      children: (
        <>
          Configuration file for [Next.js](https://nextjs.org/) to customize
          build and runtime behavior.
        </>
      ),
    },
    {
      path: 'postcss.config.mjs',
      status: 'added',
      required: false,
      children: (
        <>
          Configuration for [PostCSS](https://postcss.org/) used with [Tailwind
          CSS](https://tailwindcss.com/).
        </>
      ),
    },
    {
      path: 'drizzle.config.dev.ts',
      status: 'added',
      required: false,
      children: (
        <>
          Development configuration for [Drizzle ORM](https://orm.drizzle.team/)
          database migrations and schema.
        </>
      ),
    },
    {
      path: 'drizzle.config.prod.ts',
      status: 'added',
      required: false,
      children: (
        <>
          Production configuration for [Drizzle ORM](https://orm.drizzle.team/)
          database migrations and schema.
        </>
      ),
    },
    {
      path: 'next-sitemap.config.js',
      status: 'added',
      required: false,
      children: (
        <>
          Configuration for
          [next-sitemap](https://github.com/iamvishnusankar/next-sitemap) to
          generate sitemaps for SEO.
        </>
      ),
    },
    {
      path: 'zap.config.ts',
      status: 'added',
      required: false,
      children: <>Custom configuration file for Zap.ts project settings.</>,
    },
    {
      path: 'zap.config.types.ts',
      status: 'added',
      required: false,
      children: <>Type definitions for Zap.ts configuration.</>,
    },
  ],
};
