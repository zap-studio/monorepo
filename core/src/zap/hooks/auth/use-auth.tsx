"use client";
import "client-only";

import { useRouter } from "@bprogress/next/app";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { SETTINGS } from "@/data/settings";
import { useCooldown } from "@/hooks/utils/use-cooldown";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { handleClientError } from "@/zap/lib/api/client";
import { AuthenticationError } from "@/zap/lib/api/errors";
import { authClient } from "@/zap/lib/auth/client";
import type {
  LoginFormSchema,
  RegisterFormSchema,
} from "@/zap/schemas/auth.schema";

type LoginFormValues = z.infer<typeof LoginFormSchema>;
type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function useAuth(callbackURL?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { cooldown, startCooldown, isInCooldown } = useCooldown();

  const sendVerificationMail = async (email: string) => {
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: ZAP_DEFAULT_SETTINGS.AUTH.VERIFIED_EMAIL_PATH,
      });
      startCooldown(SETTINGS.MAIL.RATE_LIMIT_SECONDS);
    } catch (error) {
      handleClientError(error);
    }
  };

  const loginWithMail = async (
    values: LoginFormValues,
    callbackURL?: string,
  ) => {
    const { email, password } = values;

    try {
      const response = await authClient.signIn.email({ email, password });

      if (response.error) {
        throw new AuthenticationError(
          "Login failed. Please check your credentials.",
        );
      }

      if (
        SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION &&
        !response.data?.user?.emailVerified
      ) {
        await sendVerificationMail(email);
        throw new AuthenticationError(
          "Please verify your email address. A verification email has been sent.",
        );
      }

      toast.success("Login successful!");
      router.push(callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN);
    } catch (error) {
      handleClientError(error);
    }
  };

  const registerWithMail = async (
    values: RegisterFormValues,
    callbackURL?: string,
  ) => {
    const { name, email, password } = values;

    try {
      const response = await authClient.signUp.email({ email, password, name });

      if (response.error) {
        handleClientError(response.error);
        return;
      }

      if (SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION) {
        await sendVerificationMail(email);
        toast.success(
          "Registration successful! Please check your email to verify your account.",
        );
        return;
      }

      toast.success("Registration successful!");
      router.push(callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_UP);
    } catch (error) {
      handleClientError(error);
    }
  };

  const withSubmitWrapper = async <T,>(action: () => Promise<T>) => {
    setIsSubmitting(true);

    let result: T | undefined;
    try {
      result = await action();
    } finally {
      setIsSubmitting(false);
    }

    return result;
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
