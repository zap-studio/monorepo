import { cookies } from "next/headers";
import { useMemo } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { isPluginEnabled } from "@/lib/plugins";
import { getProducts } from "@/zap/payments/utils";
import { AppSidebar, SidebarHeader } from "../components";

export interface _AppLayoutProps {
  children: React.ReactNode;
}

const isPaymentsEnabled = isPluginEnabled("payments");

export async function _AppLayout({ children }: _AppLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const products = isPaymentsEnabled ? getProducts() : [];

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar products={products} />
      <SidebarInset>
        <SidebarHeader />
        <main className="mt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
