import Link from "next/link";

import { ZAP_CORE_CONFIG } from "@/zap.config";
import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";
import { ZapButton } from "@/zap/components/core";

export interface _SuccessPageProps {
  searchParams: Promise<{
    checkout_id?: string;
  }>;
}

export async function _SuccessPage({ searchParams }: _SuccessPageProps) {
  await getAuthServerDataOrRedirectToLoginService();

  const { checkout_id } = await searchParams;

  if (!checkout_id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-bold">Unexpected Error</h1>

        <p className="text-muted-foreground">
          Missing checkout ID. Please try again.
        </p>

        <ZapButton asChild variant={"ghost"}>
          <Link href={`${ZAP_CORE_CONFIG.APP.APP_URL}/billing`}>
            Go back to Billing
          </Link>
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

      <ZapButton asChild variant={"ghost"}>
        <Link href={ZAP_CORE_CONFIG.APP.APP_URL}>Go back to App</Link>
      </ZapButton>
    </div>
  );
}
