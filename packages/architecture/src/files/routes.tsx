import { L } from "../helpers/link.js";
import type { FileList } from "../types.js";

export const RoutesFiles: FileList = {
  category: "ROUTES",
  entries: [
    {
      path: "src/app/api/auth/[...all]/route.ts",
      status: "added",
      required: false,
      plugins: ["auth"],
      children: (
        <>
          Authentication API route for handling all auth-related requests with
          <L href="https://better-auth.com">Better Auth</L>.
        </>
      ),
    },
    {
      path: "src/app/rpc/[[...rest]]/route.ts",
      status: "added",
      required: false,
      plugins: ["api"],
      children: (
        <>
          RPC API route for handling all RPC-related requests with
          <L href="https://orpc.unnoq.com">oRPC</L>.
        </>
      ),
    },
  ],
};
