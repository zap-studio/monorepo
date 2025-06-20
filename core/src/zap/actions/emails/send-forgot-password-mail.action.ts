"use server";
import "server-only";

import { Effect } from "effect";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { ForgotPasswordEmail } from "@/zap/components/emails/forgot-password-email";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface ForgotPasswordEmailProps {
  subject: string;
  recipients: string[];
  url: string;
}

export const sendForgotPasswordMail = async ({
  subject,
  recipients,
  url,
}: ForgotPasswordEmailProps) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const { data, error } = yield* _(
        Effect.tryPromise({
          try: () =>
            resend.emails.send({
              from,
              to: recipients,
              subject,
              react: ForgotPasswordEmail({ url }),
            }),
          catch: (e) => e,
        }),
      );

      if (error) {
        return yield* _(Effect.fail(error));
      }

      return data;
    }),
  );
};
