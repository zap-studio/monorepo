import { getServerPlugin } from "@/lib/zap.server";
import { LoginForm } from "@/zap/auth/components/forms/login-form";
import { _AuthPage } from "@/zap/auth/pages/auth.page";

const authConfig = getServerPlugin("auth").config ?? {};

export default function LoginPage() {
  return (
    <_AuthPage
      bottomText={{
        label: "Don't have an account?",
        linkText: "Sign up",
        linkHref: "/register",
      }}
      config={authConfig}
      description="Login with your Github or Google account"
      form={<LoginForm />}
      title="Welcome back"
    />
  );
}
