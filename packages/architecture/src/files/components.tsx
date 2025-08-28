import { Categories } from '../categories';
import type { FileList } from '../types';

export const ComponentsFiles: FileList = {
  category: Categories.COMPONENTS,
  entries: [
    {
      path: 'src/components/ui/',
      status: 'added',
      required: true,
      folder: true,
      children: (
        <>
          Various UI components from [shadcn/ui](https://ui.shadcn.com/). Note
          that [Ultracite](https://ultracite.ai/) ignores this directory to keep
          original code as is.
        </>
      ),
    },
  ],
};
