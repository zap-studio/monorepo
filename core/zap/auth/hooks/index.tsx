"use client";
import "client-only";

import { useRouter } from "@bprogress/next/app";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { useCooldown } from "@/hooks/utils/use-cooldown";
import { ZAP_CONFIG } from "@/zap.config";
import { useZapQuery } from "../../api/hooks";
import { orpc } from "../../api/providers/orpc/client";
import { AuthenticationError } from "../../errors";
import { handleClientError } from "../../errors/client";
import { betterAuthClient } from "../providers/better-auth/client";
import type { LoginFormSchema, RegisterFormSchema } from "../schemas";

export function useNumberOfUsers() {
  return useZapQuery(orpc.auth.getNumberOfUsers.queryOptions());
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
        callbackURL: ZAP_CONFIG.AUTH.VERIFIED_EMAIL_PATH,
      });
      startCooldown(ZAP_CONFIG.MAILS.RATE_LIMIT_SECONDS);
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
      const response = await betterAuthClient.signIn.email({ email, password });

      if (response.error) {
        throw new AuthenticationError(
          "Login failed. Please check your credentials.",
        );
      }

      if (
        ZAP_CONFIG.AUTH.REQUIRE_MAIL_VERIFICATION &&
        !response.data?.user?.emailVerified
      ) {
        await sendVerificationMail(email);
        throw new AuthenticationError(
          "Please verify your email address. A verification email has been sent.",
        );
      }

      toast.success("Login successful!");
      router.push(callbackURL || ZAP_CONFIG.AUTH.REDIRECT_URL_AFTER_SIGN_IN);
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
      const response = await betterAuthClient.signUp.email({
        email,
        password,
        name,
      });

      if (response.error) {
        throw new AuthenticationError(
          response.error?.message || "Registration failed. Please try again.",
          response.error,
        );
      }

      if (ZAP_CONFIG.AUTH.REQUIRE_MAIL_VERIFICATION) {
        await sendVerificationMail(email);
        toast.success(
          "Registration successful! Please check your email to verify your account.",
        );
        return;
      }

      toast.success("Registration successful!");
      router.push(callbackURL || ZAP_CONFIG.AUTH.REDIRECT_URL_AFTER_SIGN_UP);
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
