"use client";
import "client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";

import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { WaitlistSchema } from "@/zap/schemas/waitlist.schema";
import { useORPC } from "@/zap/stores/orpc.store";
import { useWaitlistStore } from "@/zap/stores/waitlist.store";

export function useWaitlist() {
  const orpc = useORPC();
  const hasJoined = useWaitlistStore((state) => state.hasJoined);
  const setHasJoined = useWaitlistStore((state) => state.setHasJoined);

  const form = useForm<z.infer<typeof WaitlistSchema>>({
    resolver: zodResolver(WaitlistSchema),
    defaultValues: { email: "" },
  });

  const { trigger, data, isMutating, error } = useZapMutation(
    orpc.waitlist.submitWaitlistEmail.key(),
    async (_key, { arg }: { arg: z.infer<typeof WaitlistSchema> }) => {
      const result = await orpc.waitlist.submitWaitlistEmail.call({
        email: arg.email,
      });

      if (result) {
        form.reset();
      }

      return result;
    },
    {
      successMessage: "Thank you for joining the waitlist!",
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
