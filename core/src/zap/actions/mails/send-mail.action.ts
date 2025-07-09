"use server";
import "server-only";

import { Effect } from "effect";
import type { JSX } from "react";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMailProps {
  input: { subject: string; recipients: string[]; react?: JSX.Element };
}

export async function sendMailAction({ input }: SendMailProps) {
  const effect = Effect.gen(function* (_) {
    const subject = input.subject;
    const recipients = input.recipients;
    const react = input.react;

    const { data, error } = yield* _(
      Effect.tryPromise({
        try: () =>
          resend.emails.send({
            from,
            to: recipients,
            subject,
            react,
          }),
        catch: () => new Error("Failed to send mail"),
      }),
    );

    if (error) {
      return yield* _(Effect.fail(error));
    }

    return data;
  });

  return await Effect.runPromise(effect);
}
