import { Categories } from '../categories';
import type { FileList } from '../types';

export const ProvidersFiles: FileList = {
  category: Categories.PROVIDERS,
  entries: [
    {
      path: 'src/providers/providers.tsx',
      status: 'added',
      required: true,
      children: (
        <>
          Context providers for managing global state and dependencies in Zap.ts
          such as `ThemeProvider` for theming, `ProgressProvider` for progress
          bar with [BProgress](https://bprogress.vercel.app/), `NuqsAdapter` to
          integrate [nuqs](https://nuqs.47ng.com/) to manage search params with
          type safety and `PluginProviders` to inject providers from Zap.ts
          plugins.
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
          with [next-themes](https://github.com/pacocoursey/next-themes).
        </>
      ),
    },
  ],
};
