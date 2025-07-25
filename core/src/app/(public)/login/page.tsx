import { SETTINGS } from "@/data/settings";
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
      description="Login with your Apple or Google account"
      form={<LoginForm />}
      redirectURL={SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN}
      title="Welcome back"
    />
  );
}
