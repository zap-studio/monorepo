import { LoginForm } from "@/zap/auth/components/forms/login-form";
import { _AuthPage } from "@/zap/auth/pages/auth.page";

export default function LoginPage() {
  return (
    <_AuthPage
      bottomText={{
        label: "Don't have an account?",
        linkText: "Sign up",
        linkHref: "/register",
      }}
      description="Login with your Github or Google account"
      form={<LoginForm />}
      title="Welcome back"
    />
  );
}
