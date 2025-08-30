import { L } from '../helpers/link.js';
import type { FileList } from '../types.js';

export const RootFiles: FileList = {
  category: 'ROOT',
  entries: [
    {
      path: 'public/',
      status: 'modified',
      required: true,
      folder: true,
      children: (
        <>
          Removed <L href="https://vercel.com/">Vercel</L> default files and
          added standard files for a better{' '}
          <L href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide">
            SEO (Search Engine Optimization)
          </L>
          .
        </>
      ),
    },
    {
      path: 'public/sw.js',
      status: 'added',
      required: false,
      plugins: ['pwa'],
      children: (
        <>
          A service worker for{' '}
          <L href="https://nextjs.org/docs/app/guides/progressive-web-apps">
            PWA (Progressive Web App)
          </L>{' '}
          support with{' '}
          <L href="https://developer.mozilla.org/en-US/docs/Web/API/Push_API">
            push notification
          </L>{' '}
          capabilities.
        </>
      ),
    },
    {
      path: 'public/fonts/',
      status: 'added',
      required: true,
      folder: true,
      children: (
        <>
          Custom fonts for the project such as{' '}
          <L href="https://vercel.com/font">Geist</L>.
        </>
      ),
    },
    {
      path: 'src/app/favicon.ico',
      status: 'modified',
      required: false,
      children: (
        <>
          Default <L href="https://nextjs.org/">Next.js</L> favicon replaced by
          a custom favicon in Zap.ts.
        </>
      ),
    },
    {
      path: 'src/app/globals.css',
      status: 'modified',
      required: true,
      children: (
        <>
          Default <L href="https://nextjs.org/">Next.js</L> global styles
          replaced by integrating <L href="https://ui.shadcn.com/">shadcn/ui</L>{' '}
          styles and adding custom global styles.
        </>
      ),
    },
    {
      path: 'src/app/layout.tsx',
      status: 'modified',
      required: true,
      children: (
        <>
          Default <L href="https://nextjs.org/">Next.js</L> layout replaced by a
          custom layout in Zap.ts with{' '}
          <L href="https://ui.shadcn.com/">shadcn/ui</L> integration,
          <L href="https://vercel.com/font">Geist</L> font, additional metadata
          for better
          <L href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide">
            SEO (Search Engine Optimization)
          </L>
          , custom providers injection and{' '}
          <L href="https://vercel.com/">Vercel</L> analytics support depending
          on the environment.
        </>
      ),
    },
  ],
};
