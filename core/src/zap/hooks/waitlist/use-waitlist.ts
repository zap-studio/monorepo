"use client";
import "client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import type z from "zod";

import { orpcClient } from "@/zap/lib/orpc/client";
import { WaitlistSchema } from "@/zap/schemas/waitlist.schema";
import { useWaitlistStore } from "@/zap/stores/waitlist.store";

export function useWaitlist() {
  const hasJoined = useWaitlistStore((state) => state.hasJoined);
  const setHasJoined = useWaitlistStore((state) => state.setHasJoined);

  const form = useForm<z.infer<typeof WaitlistSchema>>({
    resolver: zodResolver(WaitlistSchema),
    defaultValues: { email: "" },
  });

  const { trigger, data, isMutating, error } = useSWRMutation(
    "submit-waitlist",
    async (_key, { arg }: { arg: z.infer<typeof WaitlistSchema> }) => {
      const result = await orpcClient.waitlist.submitWaitlistEmail({
        email: arg.email,
      });

      if (result.success) {
        form.reset();
      }

      return result;
    },
  );

  const onSubmit = async (_data: z.infer<typeof WaitlistSchema>) => {
    await trigger(_data);
    setHasJoined(true);
  };

  return {
    form,
    onSubmit,
    result: data,
    loading: isMutating,
    error,
    hasJoined,
  };
}
