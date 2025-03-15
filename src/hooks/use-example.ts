import { useORPC } from "@/providers/orpc-provider";
import useSWR from "swr";

export const useExample = () => {
  const orpc = useORPC();
  return useSWR(orpc.example.key, orpc.example.queryOptions().queryFn);
};
