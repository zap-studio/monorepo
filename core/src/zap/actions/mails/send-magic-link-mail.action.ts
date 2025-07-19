"use server";
import "server-only";

import { Effect } from "effect";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { MagicLinkMail } from "@/zap/components/mails/magic-link.mail";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMagicLinkMailProps {
  input: { subject: string; recipients: string[]; url: string };
}

export async function sendMagicLinkMailAction({
  input,
}: SendMagicLinkMailProps) {
  const effect = Effect.gen(function* (_) {
    const subject = input.subject;
    const recipients = input.recipients;
    const url = input.url;

    const { data, error } = yield* _(
      Effect.tryPromise({
        try: () =>
          resend.emails.send({
            from,
            to: recipients,
            subject,
            react: MagicLinkMail({ url }),
          }),
        catch: () => new Error("Failed to send magic link mail"),
      }),
    );

    if (error) {
      return yield* _(Effect.fail(error));
    }

    return data;
  });

  return await Effect.runPromise(effect);
}
