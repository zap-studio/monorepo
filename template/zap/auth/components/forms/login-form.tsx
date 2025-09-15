"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";

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
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { AuthClientPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { useAuth } from "../../hooks";
import { $LoginFormSchema } from "../../schemas";

type LoginFormValues = z.infer<ReturnType<typeof $LoginFormSchema>>;

type LoginFormProps = {
  pluginConfigs: {
    auth: Partial<AuthClientPluginConfig>;
  };
};

export function LoginForm({ pluginConfigs }: LoginFormProps) {
  const [callbackURL, setCallbackURL] = useState<string | undefined>(undefined);
  const { isInCooldown, cooldown, isSubmitting, handleLoginSubmit } = useAuth(
    pluginConfigs,
    callbackURL
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");

    if (redirect) {
      setCallbackURL(redirect);
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver($LoginFormSchema(pluginConfigs)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="grid gap-6"
        onSubmit={form.handleSubmit(handleLoginSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  className="text-sm underline-offset-4 hover:underline active:underline"
                  href={{
                    pathname:
                      pluginConfigs.auth.FORGOT_PASSWORD_URL ??
                      DEFAULT_CONFIG.auth.FORGOT_PASSWORD_URL,
                  }}
                >
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input
                  autoComplete="password"
                  placeholder="*********"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ZapButton
          className="w-full"
          disabled={isInCooldown}
          loading={isSubmitting}
          loadingText="Logging in..."
          type="submit"
        >
          {isInCooldown ? `Please wait ${cooldown}s` : "Login"}
        </ZapButton>
      </form>
    </Form>
  );
}
