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

import { useAuth } from "../../hooks";
import { LoginFormSchema } from "../../schemas";
import { ZAP_AUTH_CONFIG } from "../../zap.plugin.config";

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export function LoginForm() {
  const [callbackURL, setCallbackURL] = useState<string | undefined>(undefined);
  const { isInCooldown, cooldown, isSubmitting, handleLoginSubmit } =
    useAuth(callbackURL);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");

    if (redirect) {
      setCallbackURL(redirect);
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
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
                  href={{ pathname: ZAP_AUTH_CONFIG.FORGOT_PASSWORD_URL }}
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
