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
      children: 'Removed Vercel defaults, added SEO-ready files.',
    },
    {
      path: 'public/sw.js',
      status: 'added',
      required: false,
      plugins: ['pwa'],
      children: 'Service worker for PWA + push notifications.',
    },
    {
      path: 'public/fonts/',
      status: 'added',
      required: true,
      folder: true,
      children: 'Custom fonts (Geist).',
    },
    {
      path: 'src/app/favicon.ico',
      status: 'modified',
      required: true,
      children: 'Zap.ts favicon replacing Next.js default.',
    },
    {
      path: 'src/app/globals.css',
      status: 'modified',
      required: true,
      children: 'Integrated shadcn/ui styles and custom global CSS.',
    },
    {
      path: 'src/app/layout.tsx',
      status: 'modified',
      required: true,
      children: 'Custom Zap.ts layout with SEO, providers, and analytics.',
    },
  ],
};
