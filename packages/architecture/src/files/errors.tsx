import { Categories } from '../categories';
import type { FileList } from '../types';

export const ErrorFiles: FileList = {
  category: Categories.ERRORS,
  entries: [
    {
      path: 'src/app/global-error.tsx',
      status: 'added',
      required: false,
      children: (
        <>
          Global error handling component for the application with a
          sophisticated error messages management.
        </>
      ),
    },
    {
      path: 'src/app/not-found.tsx',
      status: 'added',
      required: false,
      children: (
        <>
          Beautiful custom 404 page for handling "Not Found" errors in the
          application.
        </>
      ),
    },
  ],
};
