"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authClient } from "@/zap/lib/auth-client";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EMAIL_RATE_LIMIT_SECONDS } from "@/data/settings";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type FormSchema = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormSchema) {
    setSubmitting(true);
    const { email } = values;

    try {
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        throw error;
      }

      toast.success("Check your email for the reset link!");
      setCooldown(EMAIL_RATE_LIMIT_SECONDS);
    } catch {
      toast.error("An error occurred while sending the reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border shadow-none">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            Forgot your password?
          </CardTitle>
          <CardDescription className="mt-2 text-center">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || cooldown > 0}
              >
                {submitting && (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                )}
                {!submitting && cooldown > 0 && `Please wait ${cooldown}s`}
                {!submitting && cooldown === 0 && "Send reset link"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
