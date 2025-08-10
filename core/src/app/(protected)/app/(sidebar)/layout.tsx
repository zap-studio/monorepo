import { cookies } from "next/headers";

import {
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getProducts } from "@/zap/payments/utils";
import { AppSidebar } from "@/zap/sidebar/components";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const products = getProducts();

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
