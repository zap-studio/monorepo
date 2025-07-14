"use client";
import "client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import { Effect } from "effect";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type z from "zod/v4";

import { client } from "@/zap/lib/orpc/client";
import { WaitlistSchema } from "@/zap/schemas/waitlist.schema";

export function useWaitlist() {
  const form = useForm<z.infer<typeof WaitlistSchema>>({
    resolver: zodResolver(WaitlistSchema),
    defaultValues: { email: "" },
  });

  const { data: waitlistCount } = useSWR("waitlist-count", async () => {
    const effect = Effect.gen(function* () {
      const count = yield* Effect.tryPromise(() =>
        client.waitlist.getNumberOfPeopleInWaitlist(),
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
          client.waitlist.submitWaitlistEmail({ email: arg.email }),
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
  };

  return {
    form,
    onSubmit,
    result: data,
    loading: isMutating,
    error: error,
    waitlistCount: waitlistCount ?? 0,
  };
}
