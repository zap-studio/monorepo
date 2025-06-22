"use server";
import "server-only";

import { Effect } from "effect";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { MagicLinkMail } from "@/zap/components/mails/magic-link.mail";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMagicLinkMailProps {
  subject: string;
  recipients: string[];
  url: string;
}

export const sendMagicLinkMail = async ({
  subject,
  recipients,
  url,
}: SendMagicLinkMailProps) => {
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
