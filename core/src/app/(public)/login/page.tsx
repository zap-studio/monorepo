import { LoginForm } from "@/zap/auth/components";
import { AuthPage } from "@/zap/auth/pages";

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
