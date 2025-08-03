import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/zap/components/sidebar/sidebar";
import { SidebarHeader } from "@/zap/components/sidebar/sidebar-header";
import { getActiveProducts } from "@/zap/lib/polar/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const products = await getActiveProducts();

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
