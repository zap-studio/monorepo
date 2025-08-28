import { Categories } from '../categories';
import type { FileList } from '../types';

export const MetadataFiles: FileList = {
  category: Categories.METADATA,
  entries: [
    {
      path: 'src/app/apple-icon.png',
      status: 'added',
      required: false,
      children:
        'Added Apple Touch Icon for better [SEO (Search Engine Optimization)](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).',
    },
    {
      path: 'src/app/fonts.ts',
      status: 'added',
      required: true,
      children:
        'Configuration file for [Geist](https://vercel.com/font) font to be used in the application.',
    },
    {
      path: 'src/app/icon.png',
      status: 'added',
      required: false,
      children:
        'Added standard icon for better [SEO (Search Engine Optimization)](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).',
    },
    {
      path: 'src/app/opengraph-image/route.tsx',
      status: 'added',
      required: false,
      children:
        'Dynamic Open Graph image generation route using [OG Image](https://og-image.vercel.app/) to create social media preview images on the fly.',
    },
    {
      path: 'src/app/manifest.ts',
      status: 'added',
      required: false,
      plugins: ['pwa'],
      children:
        'Configuration file for the [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) to provide metadata for the application when installed on a device or added to the home screen as a [PWA (Progressive Web App)](https://web.dev/progressive-web-apps/).',
    },
  ],
};
