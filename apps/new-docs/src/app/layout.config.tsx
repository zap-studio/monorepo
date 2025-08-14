import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <span className="font-bold text-base">Zap.ts ⚡️</span>
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
    {
      text: 'Best Practices',
      url: '/docs/misc/best-practices',
    },
    {
      text: 'Contributors',
      url: '/contributors',
    },
    {
      text: 'Discussions',
      url: 'https://github.com/alexandretrotel/zap.ts/discussions',
      external: true,
    },
    {
      text: 'Demo',
      url: 'https://demo.zap-ts.alexandretrotel.org',
      external: true,
    },
  ],
};
