"use server";
import "server-only";

import { Effect } from "effect";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { MagicLinkMail } from "@/zap/components/emails/magic-link-mail";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMagicLinkEmailProps {
  subject: string;
  recipients: string[];
  url: string;
}

export const sendMagicLinkEmail = async ({
  subject,
  recipients,
  url,
}: SendMagicLinkEmailProps) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const { data, error } = yield* _(
        Effect.tryPromise({
          try: () =>
            resend.emails.send({
              from,
              to: recipients,
              subject,
              react: MagicLinkMail({ url }),
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
