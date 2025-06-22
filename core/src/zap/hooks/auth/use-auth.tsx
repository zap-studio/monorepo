import { useRouter } from "@bprogress/next/app";
import { Effect } from "effect";
import { toast } from "sonner";
import { z } from "zod/v4";

import { SETTINGS } from "@/data/settings";
import { useCooldown } from "@/hooks/utils/use-cooldown";
import { authClient } from "@/zap/lib/auth/client";
import { LoginFormSchema, RegisterFormSchema } from "@/zap/schemas/auth.schema";

type LoginFormValues = z.infer<typeof LoginFormSchema>;
type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function useAuth() {
  const router = useRouter();
  const { cooldown, startCooldown, isInCooldown } = useCooldown();

  const sendVerificationMail = async (email: string, callbackURL: string) => {
    try {
      await Effect.tryPromise({
        try: () => authClient.sendVerificationEmail({ email, callbackURL }),
        catch: () => ({ error: true }),
      }).pipe(
        Effect.tap(() =>
          Effect.sync(() => startCooldown(SETTINGS.MAIL.RATE_LIMIT_SECONDS)),
        ),
        Effect.runPromise,
      );
    } catch {
      throw new Error("Failed to send verification email.");
    }
  };

  const loginWithMail = async (
    values: LoginFormValues,
    callbackURL?: string | null,
  ) => {
    const { email, password } = values;
    try {
      const result = await Effect.tryPromise({
        try: () => authClient.signIn.email({ email, password }),
        catch: (e) => e,
      })
        .pipe(
          Effect.match({
            onSuccess: async (response) => {
              if (
                SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION &&
                !response.data?.user?.emailVerified
              ) {
                await sendVerificationMail(email, "/app");
                throw new Error("Please verify your email address.");
              }

              toast.success("Login successful!");
              router.push(
                callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN,
              );
            },
            onFailure: () => {
              throw new Error("Login failed.");
            },
          }),
        )
        .pipe(Effect.runPromise);
      return result;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred.",
      );
      throw error;
    }
  };

  const registerWithMail = async (
    values: RegisterFormValues,
    callbackURL?: string | null,
  ) => {
    const { name, email, password } = values;
    try {
      const result = await Effect.tryPromise({
        try: () => authClient.signUp.email({ email, password, name }),
        catch: (e) => e,
      })
        .pipe(
          Effect.match({
            onSuccess: async () => {
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
            onFailure: () => {
              throw new Error("Registration failed.");
            },
          }),
        )
        .pipe(Effect.runPromise);
      return result;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred.",
      );
      throw error;
    }
  };

  return { loginWithMail, registerWithMail, isInCooldown, cooldown };
}
