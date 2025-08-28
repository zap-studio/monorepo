import { Categories } from '../categories';
import type { FileList } from '../types';

export const LibrariesFiles: FileList = {
  category: Categories.LIBRARIES,
  entries: [
    {
      path: 'src/lib/fetch.ts',
      status: 'added',
      required: false,
      plugins: ['auth'],
      children: (
        <>
          Custom fetch wrapper for making API requests with
          [Zod](https://zod.dev/) validation and error handling, it works in
          Edge and Node.js environments.
        </>
      ),
    },
    {
      path: 'src/lib/plugins.ts',
      status: 'added',
      required: true,
      children: <>Plugin management library for handling Zap.ts plugins.</>,
    },
    {
      path: 'src/lib/utils.ts',
      status: 'added',
      required: true,
      children: (
        <>
          Utility functions such as `cn` (class names) that is needed by
          [shadcn/ui](https://ui.shadcn.com/).
        </>
      ),
    },
  ],
};
