import { Categories } from '../categories';
import type { FileList } from '../types';

export const InstrumentationFiles: FileList = {
  category: Categories.INSTRUMENTATION,
  entries: [
    {
      path: 'src/instrumentation.edge.ts',
      status: 'added',
      required: true,
      children: <>Instrumentation for the Edge runtime environment.</>,
    },
    {
      path: 'src/instrumentation.node.ts',
      status: 'added',
      required: true,
      children: <>Instrumentation for the Node.js runtime environment.</>,
    },
    {
      path: 'src/instrumentation.ts',
      status: 'added',
      required: true,
      children: (
        <>
          Shared instrumentation code for both Edge and Node.js environments,
          following [Next.js instrumentation
          guidelines](https://nextjs.org/docs/app/guides/instrumentation#importing-runtime-specific-code).
        </>
      ),
    },
  ],
};
