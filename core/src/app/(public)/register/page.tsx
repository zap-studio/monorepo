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
      description="Sign up with your Github or Google account"
      form={<RegisterForm />}
      title="Create your account"
    />
  );
}
