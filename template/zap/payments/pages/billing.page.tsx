import Link from "next/link";
import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";
import { ZapButton } from "@/zap/components/core/button";
import { SUPPORT_EMAIL } from "@/zap.config";
import { BillingCards } from "../components/billing-cards";
import { FAQ } from "../components/faq";

export async function _BillingPage() {
  await getAuthServerDataOrRedirectToLoginService();

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-4 px-4 py-12 md:py-24">
      <div className="flex flex-col items-center space-y-4 text-center">
        <h1 className="font-bold text-3xl">Upgrade to Pro</h1>
        <p className="max-w-2xl text-muted-foreground">
          Unlock the full potential of Zap.ts with our Pro subscription. Get
          access to advanced features, priority support, and everything you need
          to build applications faster.
        </p>
      </div>

      <div className="flex flex-col space-y-16">
        <BillingCards />
        <FAQ />
      </div>

      <div className="mx-auto max-w-2xl text-center text-muted-foreground text-sm">
        <p>
          Need help? Contact our{" "}
          <ZapButton asChild className="h-auto p-0 text-sm" variant="link">
            <Link href={`mailto:${SUPPORT_EMAIL}`} target="_blank">
              support team
            </Link>
          </ZapButton>{" "}
          for assistance with your subscription.
        </p>
      </div>
    </div>
  );
}
