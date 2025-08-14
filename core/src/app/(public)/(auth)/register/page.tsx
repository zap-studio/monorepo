import { RegisterForm } from "@/zap/auth/components";
import { _AuthPage } from "@/zap/auth/pages";

export default function RegisterPage() {
  return (
    <_AuthPage
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
