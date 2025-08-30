import { L } from '../helpers/link.js';
import type { FileList } from '../types.js';

export const InstrumentationFiles: FileList = {
  category: 'INSTRUMENTATION',
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
          following{' '}
          <L href="https://nextjs.org/docs/app/guides/instrumentation#importing-runtime-specific-code">
            Next.js instrumentation guidelines
          </L>
          .
        </>
      ),
    },
  ],
};
