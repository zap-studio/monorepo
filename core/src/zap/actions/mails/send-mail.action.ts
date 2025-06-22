"use server";
import "server-only";

import { Effect } from "effect";
import type { JSX } from "react";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMailProps {
  subject: string;
  recipients: string[];
  react?: JSX.Element;
}

export const sendMail = async ({
  subject,
  recipients,
  react,
}: SendMailProps) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const { data, error } = yield* _(
        Effect.tryPromise({
          try: () =>
            resend.emails.send({
              from,
              to: recipients,
              subject,
              react,
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
