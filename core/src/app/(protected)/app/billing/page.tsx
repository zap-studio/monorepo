import { Crown } from "lucide-react";
import { headers } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZapButton } from "@/components/zap-ui/button";
import { BillingCards } from "@/zap/components/payments/billing-cards";
import { getAuthDataOrRedirectToLogin } from "@/zap/lib/auth/redirects";

export default async function BillingPage() {
  const _headers = await headers();
  await getAuthDataOrRedirectToLogin(_headers);

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex items-center gap-2">
          <Crown className="size-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Unlock the full potential of Zap.ts with our Pro subscription. Get
          access to advanced features, priority support, and everything you need
          to build applications faster.
        </p>
      </div>

      <BillingCards />

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <h2 className="text-center text-2xl font-bold">
          Frequently Asked Questions
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your access
                will continue until the end of your billing period.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee. If you&apos;re not
                satisfied with your Pro subscription, contact our support team
                for a full refund.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                What payment methods do you accept?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and other payment
                methods through our secure payment processor.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Can I upgrade or downgrade my plan?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes, you can switch between monthly and yearly plans at any
                time. Changes will be reflected in your next billing cycle.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-muted-foreground mx-auto max-w-2xl text-center text-sm">
        <p>
          Need help? Contact our{" "}
          <ZapButton className="h-auto p-0 text-sm" variant="link">
            support team
          </ZapButton>{" "}
          for assistance with your subscription.
        </p>
      </div>
    </div>
  );
}
