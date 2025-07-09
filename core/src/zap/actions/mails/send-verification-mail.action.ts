"use server";
import "server-only";

import { Effect } from "effect";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { VerificationMail } from "@/zap/components/mails/verification.mail";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

interface SendVerificationMailProps {
  input: { subject: string; recipients: string[]; url: string };
}

export async function sendVerificationMailAction({
  input,
}: SendVerificationMailProps) {
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
            react: VerificationMail({ url }),
          }),
        catch: () => new Error("Failed to send verification mail"),
      }),
    );

    if (error) {
      return yield* _(Effect.fail(error));
    }

    return data;
  });

  return await Effect.runPromise(effect);
}
