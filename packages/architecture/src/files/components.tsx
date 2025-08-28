import type { FileList } from '../types';
import { L } from '../helpers/link';

export const ComponentsFiles: FileList = {
  category: 'COMPONENTS',
  entries: [
    {
      path: 'src/components/ui/',
      status: 'added',
      required: true,
      folder: true,
      children: (
        <>
          Various UI components from{' '}
          <L href="https://ui.shadcn.com/">shadcn/ui</L>. Note that{' '}
          <L href="https://ultracite.ai/">Ultracite</L> ignores this directory
          to keep original code as is.
        </>
      ),
    },
  ],
};
