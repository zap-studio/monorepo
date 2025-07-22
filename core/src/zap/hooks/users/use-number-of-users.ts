import useSWRImmutable from "swr/immutable";

import { useORPC } from "@/zap/stores/orpc.store";

export function useNumberOfUsers() {
  const orpc = useORPC();

  return useSWRImmutable(
    orpc.users.getNumberOfUsers.key(),
    orpc.users.getNumberOfUsers.queryOptions().queryFn,
  );
}
