import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { ResetPasswordForm } from "../components/forms/reset-password-form";

export function _ResetPasswordPage({
  pluginConfigs,
}: {
  pluginConfigs: { auth: Partial<AuthServerPluginConfig> };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md border shadow-none">
        <CardHeader>
          <CardTitle className="text-center font-bold text-3xl tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription className="mt-2 text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResetPasswordForm pluginConfigs={pluginConfigs} />
        </CardContent>
      </Card>
    </div>
  );
}
