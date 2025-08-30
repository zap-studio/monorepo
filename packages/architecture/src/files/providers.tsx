import { L } from '../helpers/link.js';
import type { FileList } from '../types.js';

export const ProvidersFiles: FileList = {
  category: 'PROVIDERS',
  entries: [
    {
      path: 'src/providers/providers.tsx',
      status: 'added',
      required: true,
      children: (
        <>
          Context providers for managing global state and dependencies in Zap.ts
          such as `ThemeProvider` for theming, `ProgressProvider` for progress
          bar with <L href="https://bprogress.vercel.app/">BProgress</L>,
          `NuqsAdapter` to integrate <L href="https://nuqs.47ng.com/">nuqs</L>{' '}
          to manage search params with type safety and `PluginProviders` to
          inject providers from Zap.ts plugins.
        </>
      ),
    },
    {
      path: 'src/providers/theme.provider.tsx',
      status: 'added',
      required: true,
      children: (
        <>
          Theme provider for managing light and dark themes in the application
          with{' '}
          <L href="https://github.com/pacocoursey/next-themes">next-themes</L>.
        </>
      ),
    },
  ],
};
