"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import type React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarMainSection } from "@/zap/components/sidebar/sidebar-main-section";
import { SidebarSecondarySection } from "@/zap/components/sidebar/sidebar-secondary-section";
import { SidebarUser } from "@/zap/components/sidebar/sidebar-user";
import { authClient } from "@/zap/lib/auth/client";

const MAIN_NAV_ITEMS = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data } = authClient.useSession();

  if (!data?.user) {
    return null;
  }

  const { email, name, image } = data.user;
  const userData = { email, name, avatar: image ?? null };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Zap.ts ⚡️</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMainSection items={MAIN_NAV_ITEMS} />
        <SidebarSecondarySection className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
