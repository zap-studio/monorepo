import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NavHeader } from "@/zap/components/features/app/sidebar/header/header";
import { AppSidebar } from "@/zap/components/features/app/sidebar/sidebar/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <NavHeader />
        <main className="mt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
