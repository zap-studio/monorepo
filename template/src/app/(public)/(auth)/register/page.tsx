import { getServerPlugin } from "@/lib/zap.server";
import { RegisterForm } from "@/zap/auth/components/forms/register-form";
import { _AuthPage } from "@/zap/auth/pages/auth.page";

const authConfig = getServerPlugin("auth").config ?? {};

export default function RegisterPage() {
  return (
    <_AuthPage
      bottomText={{
        label: "Already have an account?",
        linkText: "Log in",
        linkHref: "/login",
      }}
      config={authConfig}
      description="Sign up with your Github or Google account"
      form={<RegisterForm />}
      title="Create your account"
    />
  );
}
