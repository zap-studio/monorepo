import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SETTINGS } from "@/data/settings";
import { PolicyLinks } from "@/zap/components/auth/policy-links";
import { RegisterForm } from "@/zap/components/auth/register-form";
import { SocialProviders } from "@/zap/components/auth/social-providers";

export default function RegisterPage() {
  return (
    <div className="bg-muted/50 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          Zap.ts ⚡️
        </Link>

        <div className={"flex flex-col gap-6"}>
          <Card className="border shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
                <CardDescription>
                  Sign up with your Apple or Google account
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
                  <>
                    <SocialProviders
                      redirectURL={SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_UP}
                    />
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </div>
                  </>
                )}

                <RegisterForm />

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link className="underline underline-offset-4" href="/login">
                    Log in
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <PolicyLinks />
        </div>
      </div>
    </div>
  );
}
