import { L } from '../helpers/link.js';
import type { FileList } from '../types.js';

export const ConfigFiles: FileList = {
  category: 'CONFIG',
  entries: [
    {
      path: 'biome.json',
      status: 'modified',
      required: false,
      children: (
        <>
          Configuration file for <L href="https://biomejs.dev/">Biome</L>, a
          linter and code formatter. We're using{' '}
          <L href="https://ultracite.ai/">Ultracite</L>
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
          Configuration file for <L href="https://nextjs.org/">Next.js</L> that
          includes additional settings for{' '}
          <L href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP">
            CSP (Content Security Policy)
          </L>{' '}
          and{' '}
          <L href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy">
            Permissions Policy
          </L>
          , sets up{' '}
          <L href="https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes">
            Typed Routes
          </L>{' '}
          by default, adds extra{' '}
          <L href="https://nextjs.org/docs/app/api-reference/config/next-config-js/headers">
            security headers
          </L>
          , configures{' '}
          <L href="https://nextjs.org/docs/app/guides/progressive-web-apps#5-creating-a-service-worker">
            sw.js
          </L>
          , and supports{' '}
          <L href="https://nextjs.org/docs/app/guides/mdx">MDX</L> along with
          <L href="https://nextjs.org/docs/app/getting-started/linking-and-navigating#hydration-not-completed">
            Bundle Analyzer
          </L>
          .
        </>
      ),
    },
    {
      path: 'package.json',
      status: 'modified',
      required: true,
      children: (
        <>
          Configuration file for <L href="https://www.npmjs.com/">npm</L> with
          additional scripts for <L href="https://biomejs.dev/">Biome</L>,{' '}
          <L href="https://orm.drizzle.team/">Drizzle ORM</L>,{' '}
          <L href="https://nextjs.org/">Next.js</L>,
          <L href="https://react.email/">React Email</L> and more. Also includes
          <L href="https://github.com/okonet/lint-staged">lint-staged</L>{' '}
          configuration with <L href="https://ultracite.ai/">Ultracite</L>{' '}
          preset.
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
          Configuration file for <L href="https://ui.shadcn.com/">shadcn/ui</L>,
          a set of accessible and customizable React components.
        </>
      ),
    },
    {
      path: 'drizzle.config.dev.ts',
      status: 'added',
      required: false,
      children: (
        <>
          Development configuration for{' '}
          <L href="https://orm.drizzle.team/">Drizzle ORM</L>
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
          Production configuration for{' '}
          <L href="https://orm.drizzle.team/">Drizzle ORM</L>
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
          <L href="https://github.com/iamvishnusankar/next-sitemap">
            next-sitemap
          </L>
          , a sitemap generation tool for Next.js applications.
        </>
      ),
    },
  ],
};
