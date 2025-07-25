import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/zap/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
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
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
