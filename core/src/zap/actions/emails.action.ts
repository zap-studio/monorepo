"use server";

import { Effect } from "effect";
import { JSX } from "react";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { ForgotPasswordEmail } from "@/zap/components/emails/forgot-password";
import { MagicLinkEmail } from "@/zap/components/emails/magic-link";
import { VerificationEmail } from "@/zap/components/emails/verification";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

interface ForgotPasswordEmailProps {
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

interface SendMailProps {
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

export const sendMagicLinkEmail = async ({
  subject,
  recipients,
  url,
}: {
  subject: string;
  recipients: string[];
  url: string;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const { data, error } = yield* _(
        Effect.tryPromise({
          try: () =>
            resend.emails.send({
              from,
              to: recipients,
              subject,
              react: MagicLinkEmail({ url }),
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
