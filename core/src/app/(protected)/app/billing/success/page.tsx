import Link from "next/link";

import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";
import { ZapButton } from "@/zap/components/core";

interface BillingSuccessPageProps {
  searchParams: Promise<{
    checkout_id?: string;
  }>;
}

export default async function BillingSuccessPage({
  searchParams,
}: BillingSuccessPageProps) {
  await getAuthServerDataOrRedirectToLoginService();

  const { checkout_id } = await searchParams;

  if (!checkout_id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-bold">Unexpected Error</h1>

        <p className="text-muted-foreground">
          Missing checkout ID. Please try again.
        </p>

        <ZapButton variant={"ghost"} asChild>
          <Link href="/app/billing">Go back to Billing</Link>
        </ZapButton>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Payment Successful!</h1>

      <p className="text-muted-foreground max-w-2xl">
        Thank you for your purchase. Your subscription has been activated and
        you now have access to all Pro features.
      </p>

      <ZapButton variant={"ghost"} asChild>
        <Link href="/app">Go back to App</Link>
      </ZapButton>
    </div>
  );
}
