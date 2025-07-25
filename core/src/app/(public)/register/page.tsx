import { SETTINGS } from "@/data/settings";
import { AuthPage } from "@/zap/components/auth/auth-page";
import { RegisterForm } from "@/zap/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthPage
      bottomText={{
        label: "Already have an account?",
        linkText: "Log in",
        linkHref: "/login",
      }}
      description="Sign up with your Apple or Google account"
      form={<RegisterForm />}
      redirectURL={SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_UP}
      title="Create your account"
    />
  );
}
