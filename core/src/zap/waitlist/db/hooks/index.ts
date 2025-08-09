"use client";
import "client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";

import { useZapMutation } from "@/zap/api/hooks/use-zap-mutation";
import { useZapQuery } from "@/zap/api/hooks/use-zap-query";
import { orpc } from "@/zap/api/providers/orpc/client";
import { WaitlistSchema } from "@/zap/waitlist/schemas";
import { useWaitlistStore } from "@/zap/waitlist/stores";

export function useWaitlist() {
  const hasJoined = useWaitlistStore((state) => state.hasJoined);
  const setHasJoined = useWaitlistStore((state) => state.setHasJoined);

  const form = useForm<z.infer<typeof WaitlistSchema>>({
    resolver: zodResolver(WaitlistSchema),
    defaultValues: { email: "" },
  });

  const queryClient = useQueryClient();
  const getNumberOfPeopleInWaitlistKey =
    orpc.waitlist.getNumberOfPeopleInWaitlist.key();

  const { data: waitlistCount } = useZapQuery(
    orpc.waitlist.getNumberOfPeopleInWaitlist.queryOptions(),
  );

  const {
    mutateAsync,
    data,
    isPending: isMutating,
    error,
  } = useZapMutation({
    ...orpc.waitlist.submitWaitlistEmail.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: getNumberOfPeopleInWaitlistKey,
        }),
    }),
    onSuccess: () => {
      form.reset();
    },
    successMessage: "Thank you for joining the waitlist!",
  });

  const onSubmit = async (_data: z.infer<typeof WaitlistSchema>) => {
    await mutateAsync(_data);
    setHasJoined(true);
  };

  return {
    form,
    onSubmit,
    waitlistCount,
    data,
    error,
    isMutating,
    hasJoined,
  };
}
