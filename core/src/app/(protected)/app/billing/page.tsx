import { headers } from "next/headers";
import Link from "next/link";

import { ZapButton } from "@/components/zap-ui/button";
import { SUPPORT_EMAIL } from "@/zap.config";
import { BillingCards } from "@/zap/components/payments/billing-cards";
import { FAQ } from "@/zap/components/payments/faq";
import { getAuthDataOrRedirectToLogin } from "@/zap/lib/auth/redirects";
import { getProducts } from "@/zap/lib/polar/utils";

export default async function BillingPage() {
  const _headers = await headers();
  await getAuthDataOrRedirectToLogin(_headers);
  const products = getProducts();

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-8 px-4 py-12 md:py-24">
      <div className="flex flex-col items-center space-y-4 text-center">
        <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
        <p className="text-muted-foreground max-w-2xl">
          Unlock the full potential of Zap.ts with our Pro subscription. Get
          access to advanced features, priority support, and everything you need
          to build applications faster.
        </p>
      </div>

      <div className="flex flex-col space-y-16">
        <BillingCards products={products} />
        <FAQ />
      </div>

      <div className="text-muted-foreground mx-auto max-w-2xl text-center text-sm">
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
