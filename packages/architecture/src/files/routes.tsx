import { Categories } from '../categories';
import type { FileList } from '../types';

export const RoutesFiles: FileList = {
  category: Categories.ROUTES,
  entries: [
    {
      path: 'src/app/api/auth/[...all]/route.ts',
      status: 'added',
      required: false,
      plugins: ['auth'],
      children: (
        <>
          Authentication API route for handling all auth-related requests with
          [Better Auth](https://better-auth.com).
        </>
      ),
    },
    {
      path: 'src/app/rpc/[[...rest]]/route.ts',
      status: 'added',
      required: false,
      plugins: ['api'],
      children: (
        <>
          RPC API route for handling all RPC-related requests with
          [oRPC](https://orpc.unnoq.com).
        </>
      ),
    },
  ],
};
