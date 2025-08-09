import { RegisterForm } from "@/zap/auth/components";
import { AuthPage } from "@/zap/auth/pages";

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
