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
        <span className="font-semibold text-base">Zap.ts ⚡️</span>
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
    {
      text: 'Demo',
      url: 'https://demo.zap-ts.zapstudio.dev',
      external: true,
    },
  ],
  githubUrl: 'https://github.com/zap-studio/zap.ts',
};
