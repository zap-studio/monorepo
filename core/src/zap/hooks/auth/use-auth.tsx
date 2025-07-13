"use client";
import "client-only";

import { useRouter } from "@bprogress/next/app";
import { Effect } from "effect";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod/v4";

import { SETTINGS } from "@/data/settings";
import { useCooldown } from "@/hooks/utils/use-cooldown";
import { authClient } from "@/zap/lib/auth/client";
import { handleCompromisedPasswordError } from "@/zap/lib/auth/utils";
import type {
  LoginFormSchema,
  RegisterFormSchema,
} from "@/zap/schemas/auth.schema";

type LoginFormValues = z.infer<typeof LoginFormSchema>;
type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function useAuth(callbackURL?: string | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { cooldown, startCooldown, isInCooldown } = useCooldown();

  const sendVerificationMail = async (email: string, callbackURL: string) => {
    const effect = Effect.tryPromise({
      try: () => authClient.sendVerificationEmail({ email, callbackURL }),
      catch: () => new Error("Failed to send verification email"),
    }).pipe(
      Effect.tap(() =>
        Effect.sync(() => startCooldown(SETTINGS.MAIL.RATE_LIMIT_SECONDS)),
      ),
    );

    return await Effect.runPromise(effect);
  };

  const loginWithMail = async (
    values: LoginFormValues,
    callbackURL?: string | null,
  ) => {
    const { email, password } = values;
    const result = await Effect.tryPromise({
      try: () => authClient.signIn.email({ email, password }),
      catch: () => new Error("Failed to login"),
    })
      .pipe(
        Effect.match({
          onSuccess: async (response) => {
            if (response.error) {
              toast.error("Login failed. Please check your credentials.");
              return;
            }

            if (
              SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION &&
              !response.data?.user?.emailVerified
            ) {
              await sendVerificationMail(email, "/app");
              toast.error(
                "Please verify your email address. A verification email has been sent.",
              );
              return;
            }

            toast.success("Login successful!");
            router.push(
              callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN,
            );
          },
          onFailure: (e) => {
            toast.error("Login failed. Please check your credentials.");
            throw e;
          },
        }),
      )
      .pipe(Effect.runPromise);
    return result;
  };

  const registerWithMail = async (
    values: RegisterFormValues,
    callbackURL?: string | null,
  ) => {
    const { name, email, password } = values;
    const result = await Effect.tryPromise({
      try: () => authClient.signUp.email({ email, password, name }),
      catch: () => new Error("Failed to register"),
    })
      .pipe(
        Effect.match({
          onSuccess: async (response) => {
            if (response.error) {
              handleCompromisedPasswordError(response.error);
              return;
            }

            if (SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION) {
              await sendVerificationMail(email, "/login");
              toast.success(
                "Registration successful! Please check your email to verify your account.",
              );
            } else {
              toast.success("Registration successful!");
            }
            router.push(
              callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_UP,
            );
          },
          onFailure: (e) => {
            handleCompromisedPasswordError(e);
          },
        }),
      )
      .pipe(Effect.runPromise);
    return result;
  };

  const withSubmitWrapper = async <T,>(
    action: () => Promise<T>,
  ): Promise<T | undefined> => {
    setIsSubmitting(true);

    const effect = Effect.tryPromise({
      try: () => action(),
      catch: () => new Error("Authentification failed"),
    }).pipe(
      Effect.tap(() => Effect.sync(() => setIsSubmitting(false))),
      Effect.catchAll(() => Effect.sync(() => undefined)),
    );

    return await Effect.runPromise(effect);
  };

  const handleLoginSubmit = (values: LoginFormValues) =>
    withSubmitWrapper(() => loginWithMail(values, callbackURL));

  const handleRegisterSubmit = (values: RegisterFormValues) =>
    withSubmitWrapper(() => registerWithMail(values, callbackURL));

  return {
    loginWithMail,
    registerWithMail,
    isInCooldown,
    cooldown,
    handleLoginSubmit,
    handleRegisterSubmit,
    isSubmitting,
  };
}
