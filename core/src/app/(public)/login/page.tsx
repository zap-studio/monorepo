import { AuthPage } from "@/zap/components/auth/auth-page";
import { LoginForm } from "@/zap/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthPage
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
