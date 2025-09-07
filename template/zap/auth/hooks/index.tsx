"use client";
import "client-only";

import { useRouter } from "@bprogress/next/app";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { useCooldown } from "@/hooks/utils/use-cooldown";
import { useZapQuery } from "@/zap/api/hooks";
import { orpcQuery } from "@/zap/api/lib/orpc";
import { AuthenticationError } from "@/zap/errors";
import { handleClientError } from "@/zap/errors/client";
import { ZAP_MAILS_CONFIG } from "@/zap/mails/zap.plugin.config";

import { betterAuthClient } from "../providers/better-auth/client";
import type { LoginFormSchema, RegisterFormSchema } from "../schemas";
import { ZAP_AUTH_CONFIG } from "../zap.plugin.config";

export function useNumberOfUsers() {
  return useZapQuery(orpcQuery.auth.getNumberOfUsers.queryOptions());
}

type LoginFormValues = z.infer<typeof LoginFormSchema>;
type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function useAuth(callbackURL?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { cooldown, startCooldown, isInCooldown } = useCooldown();

  const sendVerificationMail = async (email: string) => {
    try {
      await betterAuthClient.sendVerificationEmail({
        email,
        callbackURL: ZAP_AUTH_CONFIG.VERIFIED_EMAIL_PATH,
      });
      startCooldown(ZAP_MAILS_CONFIG.RATE_LIMIT_SECONDS);
    } catch (error) {
      handleClientError(error);
    }
  };

  const loginWithMail = async (
    values: LoginFormValues,
    loginCallbackURL?: string
  ) => {
    const { email, password } = values;

    try {
      const response = await betterAuthClient.signIn.email({ email, password });

      if (response.error) {
        throw new AuthenticationError(
          "Login failed. Please check your credentials."
        );
      }

      if (
        ZAP_AUTH_CONFIG.REQUIRE_MAIL_VERIFICATION &&
        !response.data?.user?.emailVerified
      ) {
        await sendVerificationMail(email);
        throw new AuthenticationError(
          "Please verify your email address. A verification email has been sent."
        );
      }

      toast.success("Login successful!");
      router.push(
        loginCallbackURL || ZAP_AUTH_CONFIG.REDIRECT_URL_AFTER_SIGN_IN
      );
    } catch (error) {
      handleClientError(error);
    }
  };

  const registerWithMail = async (
    values: RegisterFormValues,
    registerCallbackURL?: string
  ) => {
    const { name, email, password } = values;

    try {
      const response = await betterAuthClient.signUp.email({
        email,
        password,
        name,
      });

      if (response.error) {
        throw new AuthenticationError(
          response.error?.message || "Registration failed. Please try again.",
          response.error
        );
      }

      if (ZAP_AUTH_CONFIG.REQUIRE_MAIL_VERIFICATION) {
        await sendVerificationMail(email);
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        return;
      }

      toast.success("Registration successful!");
      router.push(
        registerCallbackURL || ZAP_AUTH_CONFIG.REDIRECT_URL_AFTER_SIGN_UP
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "PASSWORD_COMPROMISED"
      ) {
        toast.error(ZAP_AUTH_CONFIG.PASSWORD_COMPROMISED_MESSAGE);
        return;
      }

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
