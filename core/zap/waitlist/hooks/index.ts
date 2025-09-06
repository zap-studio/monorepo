"use client";
import "client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";

import { useZapMutation, useZapQuery } from "@/zap/api/hooks";
import { orpcQuery } from "@/zap/api/lib/orpc";

import { WaitlistSchema } from "../schemas";
import { useWaitlistStore } from "../stores";

export function useWaitlist() {
  const hasJoined = useWaitlistStore((state) => state.hasJoined);
  const setHasJoined = useWaitlistStore((state) => state.setHasJoined);

  const form = useForm<z.infer<typeof WaitlistSchema>>({
    resolver: zodResolver(WaitlistSchema),
    defaultValues: { email: "" },
  });

  const queryClient = useQueryClient();
  const getNumberOfPeopleInWaitlistKey =
    orpcQuery.waitlist.getNumberOfPeopleInWaitlist.key();

  const { data: waitlistCount } = useZapQuery(
    orpcQuery.waitlist.getNumberOfPeopleInWaitlist.queryOptions()
  );

  const {
    mutateAsync,
    data,
    isPending: isMutating,
    error,
  } = useZapMutation({
    ...orpcQuery.waitlist.submitWaitlistEmail.mutationOptions({
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
