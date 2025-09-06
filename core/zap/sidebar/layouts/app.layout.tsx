import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/sidebar";
import { SidebarHeader } from "../components/sidebar-header";

export type _AppLayoutProps = {
  children: React.ReactNode;
};

export async function _AppLayout({ children }: _AppLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <SidebarHeader />
        <main className="mt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
