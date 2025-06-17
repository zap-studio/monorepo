import { Effect } from "effect";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import type { ForgotPasswordEmailProps } from "@/zap/actions/emails/send-forgot-password-mail.action";
import { VerificationEmail } from "@/zap/components/emails/verification-email";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export const sendVerificationEmail = async ({
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
              react: VerificationEmail({ url }),
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
