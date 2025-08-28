import { Categories } from '../categories';
import type { FileList } from '../types';

export const RootFiles: FileList = {
  category: Categories.ROOT,
  entries: [
    {
      path: 'public/',
      status: 'modified',
      required: true,
      folder: true,
      children: (
        <>
          Removed [Vercel](https://vercel.com/) default files and added standard
          files for a better [SEO (Search Engine
          Optimization)](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
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
          A service worker for [PWA (Progressive Web
          App)](https://nextjs.org/docs/app/guides/progressive-web-apps) support
          with [push
          notification](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
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
          Custom fonts for the project such as [Geist](https://vercel.com/font).
        </>
      ),
    },
    {
      path: 'src/app/favicon.ico',
      status: 'modified',
      required: false,
      children: (
        <>
          Default [Next.js](https://nextjs.org/) favicon replaced by a custom
          favicon in Zap.ts.
        </>
      ),
    },
    {
      path: 'src/app/globals.css',
      status: 'modified',
      required: true,
      children: (
        <>
          Default [Next.js](https://nextjs.org/) global styles replaced by
          integrating [shadcn/ui](https://ui.shadcn.com/) styles and adding
          custom global styles.
        </>
      ),
    },
    {
      path: 'src/app/layout.tsx',
      status: 'modified',
      required: true,
      children: (
        <>
          Default [Next.js](https://nextjs.org/) layout replaced by a custom
          layout in Zap.ts with [shadcn/ui](https://ui.shadcn.com/) integration,
          [Geist](https://vercel.com/font) font, additional metadata for better
          [SEO (Search Engine
          Optimization)](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
          custom providers injection and [Vercel](https://vercel.com/) analytics
          support depending on the environment.
        </>
      ),
    },
  ],
};
