"use client";

import { useRouter } from "@bprogress/next/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { Effect } from "effect";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod/v4";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ZapButton } from "@/components/zap-ui/button";
import { authClient } from "@/zap/lib/auth/client";
import { handleCompromisedPasswordError } from "@/zap/lib/auth/utils";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormSchema = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    setToken(token);
  }, []);

  const onSubmit = async (values: FormSchema) => {
    setSubmitting(true);
    const { password } = values;

    if (!token) {
      toast.error("Invalid token. Please try again.");
      setSubmitting(false);
      return;
    }

    await Effect.tryPromise({
      try: () =>
        authClient.resetPassword({
          newPassword: password,
          token,
        }),
      catch: () => ({ error: true }),
    })
      .pipe(
        Effect.match({
          onSuccess: () => {
            toast.success("Password reset successfully!");
            form.reset();
            router.push("/login");
          },
          onFailure: (error: unknown) => {
            handleCompromisedPasswordError(error);
          },
        }),
      )
      .pipe(Effect.runPromise)
      .catch(() => {
        toast.error("An error occurred while resetting your password.");
      });

    setSubmitting(false);
  };

  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border shadow-none">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription className="mt-2 text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ZapButton
                loading={submitting}
                loadingText="Resetting..."
                type="submit"
                className="w-full"
              >
                Reset Password
              </ZapButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
