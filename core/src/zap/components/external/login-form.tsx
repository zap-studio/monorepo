"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/zap/lib/auth/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2 } from "lucide-react";
import { SETTINGS } from "@/data/settings";
import { useCooldown } from "@/zap/hooks/utils/use-cooldown";
import { Effect } from "effect";

type Provider = "apple" | "google";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [loading, setLoading] = useState(false);
  const { cooldown, startCooldown, isInCooldown } = useCooldown();
  const [callbackURL, setCallbackURL] = useState<string | null>(null);

  useEffect(() => {
    const callbackURL = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    if (callbackURL) {
      setCallbackURL(callbackURL);
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    const { email, password } = values;
    await Effect.tryPromise({
      try: () => authClient.signIn.email({ email, password }),
      catch: () => ({ error: true }),
    })
      .pipe(
        Effect.match({
          onSuccess: ({ data, error }) => {
            if (error) {
              toast.error("Login failed. Please try again.");
              return Effect.void;
            }

            if (
              SETTINGS.AUTH.REQUIRE_EMAIL_VERIFICATION &&
              !data?.user?.emailVerified
            ) {
              toast.error(
                "Please verify your email address. An email has been sent.",
              );
              return Effect.tryPromise({
                try: () =>
                  authClient.sendVerificationEmail({
                    email,
                    callbackURL: "/app",
                  }),
                catch: () => ({ error: true }),
              }).pipe(
                Effect.tap(() =>
                  Effect.sync(() => {
                    startCooldown(SETTINGS.MAIL.RATE_LIMIT_SECONDS);
                  }),
                ),
                Effect.runPromise,
              );
            }
            toast.success("Login successful!");
            router.push(
              callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN,
            );
            return Effect.void;
          },
          onFailure: () => {
            toast.error("Login failed. Please try again.");
            return Effect.void;
          },
        }),
      )
      .pipe(Effect.runPromise)
      .catch(() => {
        toast.error("Login failed. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
            <CardDescription>
              Login with your Apple or Google account
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
              <>
                <div className="flex flex-col gap-4">
                  <SocialProviderButton
                    provider="apple"
                    redirectURL={SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN}
                  />
                  <SocialProviderButton
                    provider="google"
                    redirectURL={SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN}
                  />
                </div>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
              </>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          autoComplete="email"
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
                          href="/forgot-password"
                          className="text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="*********"
                          autoComplete="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || isInCooldown}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Logging in...
                    </>
                  ) : isInCooldown ? (
                    `Please wait ${cooldown}s`
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <Link href="/terms-of-service">Terms of Service</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </div>
    </div>
  );
}

interface SocialProviderButtonProps {
  provider: Provider;
  redirectURL: string;
}

function SocialProviderButton({
  provider,
  redirectURL,
}: SocialProviderButtonProps) {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSocialLogin = async (provider: Provider) => {
    setLoading(true);
    await Effect.tryPromise({
      try: () => authClient.signIn.social({ provider }),
      catch: () => ({ error: true }),
    })
      .pipe(
        Effect.match({
          onSuccess: ({ data, error }) => {
            if (error) {
              toast.error("Login failed. Please try again.");
              return Effect.void;
            }
            if (data) {
              toast.success("Login successful!");
              router.push(redirectURL);
            } else {
              toast.error("Login failed. Please try again.");
            }
            return Effect.void;
          },
          onFailure: () => {
            toast.error("Login failed. Please try again.");
            return Effect.void;
          },
        }),
      )
      .pipe(Effect.runPromise)
      .catch(() => {
        toast.error("Login failed. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const icons: Record<Provider, JSX.Element> = {
    apple: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
          fill="currentColor"
        />
      </svg>
    ),
    google: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  const labels: Record<Provider, string> = {
    apple: "Login with Apple",
    google: "Login with Google",
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      onClick={() => handleSocialLogin(provider)}
    >
      {loading && (
        <>
          <Loader2 size={16} className="animate-spin" />
          Logging in...
        </>
      )}
      {!loading && (
        <>
          {icons[provider]}
          {labels[provider]}
        </>
      )}
    </Button>
  );
}
