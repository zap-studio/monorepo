import { Categories } from '../categories';
import type { FileList } from '../types';

export const ConfigFiles: FileList = {
  category: Categories.CONFIG,
  entries: [
    {
      path: 'biome.json',
      status: 'modified',
      required: false,
      children: (
        <>
          Configuration file for [Biome](https://biomejs.dev/), a linter and
          code formatter. We're using [Ultracite](https://www.ultracite.ai/)
          preset for better collaborations between AI and developers.
        </>
      ),
    },
    {
      path: 'next.config.ts',
      status: 'modified',
      required: true,
      children: (
        <>
          Configuration file for [Next.js](https://nextjs.org/) that includes
          additional settings for [CSP (Content Security
          Policy)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) and
          [Permissions
          Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy),
          sets up [Typed
          Routes](https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes)
          by default, adds extra [security
          headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers),
          configures
          [sw.js](https://nextjs.org/docs/app/guides/progressive-web-apps#5-creating-a-service-worker),
          and supports [MDX](https://nextjs.org/docs/app/guides/mdx) along with
          [Bundle
          Analyzer](https://nextjs.org/docs/app/getting-started/linking-and-navigating#hydration-not-completed).
        </>
      ),
    },
    {
      path: 'package.json',
      status: 'modified',
      required: true,
      children: (
        <>
          Configuration file for [npm](https://www.npmjs.com/) with additional
          scripts for [Biome](https://biomejs.dev/), [Drizzle
          ORM](https://orm.drizzle.team/), [Next.js](https://nextjs.org/),
          [React Email](https://react.email/) and more. Also includes
          [lint-staged](https://github.com/okonet/lint-staged) configuration
          with [Ultracite](https://ultracite.ai/) preset.
        </>
      ),
    },
    {
      path: 'tsconfig.json',
      status: 'modified',
      required: true,
      children: (
        <>
          TypeScript configuration file with paths and settings optimized for
          Zap.ts such as `strictNullChecks`.
        </>
      ),
    },
    {
      path: 'components.json',
      status: 'added',
      required: true,
      children: (
        <>
          Configuration file for [shadcn/ui](https://ui.shadcn.com/), a set of
          accessible and customizable React components.
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
          Configuration file for
          [next-sitemap](https://github.com/iamvishnusankar/next-sitemap), a
          sitemap generation tool for Next.js applications.
        </>
      ),
    },
  ],
};
