"use client";
import "client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import { Effect } from "effect";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type z from "zod/v4";

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

  const { data: waitlistCount } = useSWR("waitlist-count", async () => {
    const effect = Effect.gen(function* () {
      const count = yield* Effect.tryPromise(() =>
        orpcClient.waitlist.getNumberOfPeopleInWaitlist(),
      );

      return count;
    });

    return await Effect.runPromise(effect);
  });

  const { trigger, data, isMutating, error } = useSWRMutation(
    "submit-waitlist",
    async (_key, { arg }: { arg: z.infer<typeof WaitlistSchema> }) => {
      const effect = Effect.gen(function* () {
        const result = yield* Effect.tryPromise(() =>
          orpcClient.waitlist.submitWaitlistEmail({ email: arg.email }),
        );

        if (result.success) {
          yield* Effect.sync(() => form.reset());
        }

        return result;
      });

      return await Effect.runPromise(effect);
    },
  );

  const onSubmit = async (data: z.infer<typeof WaitlistSchema>) => {
    await trigger(data);
    setHasJoined(true);
  };

  return {
    form,
    onSubmit,
    result: data,
    loading: isMutating,
    error,
    waitlistCount: waitlistCount ?? 0,
    hasJoined,
  };
}
