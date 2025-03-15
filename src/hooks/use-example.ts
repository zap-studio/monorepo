import { useORPC } from "@/providers/orpc-provider";
import { useQuery } from "@tanstack/react-query";

export const useExample = () => {
  const orpc = useORPC();
  return useQuery(orpc.example.queryOptions());
};
