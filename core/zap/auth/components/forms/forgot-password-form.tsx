"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { useCooldown } from "@/hooks/utils/use-cooldown";
import { ZapButton } from "@/zap/components/core/button";
import { handleClientError } from "@/zap/errors/client";
import { ZAP_MAILS_CONFIG } from "@/zap/mails/zap.plugin.config";

import { betterAuthClient } from "../../providers/better-auth/client";

const formSchema = z.object({
  email: z.email("Please enter a valid email address"),
});
type FormSchema = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const { cooldown, startCooldown, isInCooldown } = useCooldown();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormSchema) => {
    setSubmitting(true);
    const { email } = values;

    try {
      await betterAuthClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      toast.success("Check your email for the reset link!");
      startCooldown(ZAP_MAILS_CONFIG.RATE_LIMIT_SECONDS);
    } catch (error) {
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com"
                  type="email"
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
          disabled={isInCooldown}
          loading={submitting}
          loadingText="Sending..."
          type="submit"
        >
          {isInCooldown ? `Please wait ${cooldown}s` : "Send reset link"}
        </ZapButton>
      </form>
    </Form>
  );
}
