"use client";

import { useRouter } from "@bprogress/next/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ZapButton } from "@/zap/components/core/button";
import { AuthenticationError } from "@/zap/errors";
import { handleClientError } from "@/zap/errors/client";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { AuthClientPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { betterAuthClient } from "../../providers/better-auth/client";

const $formSchema = (pluginConfigs: {
  auth: Partial<AuthClientPluginConfig>;
}) =>
  z
    .object({
      password: z
        .string()
        .min(
          pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ??
            DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH,
          `Password must be at least ${pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ?? DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH} characters`
        ),
      confirmPassword: z
        .string()
        .min(
          pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ??
            DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH,
          `Password must be at least ${pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ?? DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH} characters`
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

type FormSchema = z.infer<ReturnType<typeof $formSchema>>;

export function ResetPasswordForm(pluginConfigs: {
  auth: Partial<AuthClientPluginConfig>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver($formSchema(pluginConfigs)),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const _token = new URLSearchParams(window.location.search).get("token");
    setToken(_token);
  }, []);

  const onSubmit = async (values: FormSchema) => {
    setSubmitting(true);
    const { password } = values;

    if (!token) {
      setSubmitting(false);
      throw new AuthenticationError("Invalid token. Please try again.");
    }

    try {
      await betterAuthClient.resetPassword({
        newPassword: password,
        token,
      });

      toast.success("Password reset successfully!");
      form.reset();
      router.push("/login");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "PASSWORD_COMPROMISED"
      ) {
        toast.error(
          pluginConfigs.auth.PASSWORD_COMPROMISED_MESSAGE ??
            DEFAULT_CONFIG.auth.PASSWORD_COMPROMISED_MESSAGE
        );
        return;
      }

      handleClientError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  {...field}
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  {...field}
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ZapButton
          className="w-full"
          loading={submitting}
          loadingText="Resetting..."
          type="submit"
        >
          Reset Password
        </ZapButton>
      </form>
    </Form>
  );
}
