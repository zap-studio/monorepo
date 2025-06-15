"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/zap/components/features/app/sidebar/main/main";
import { NavSecondary } from "@/zap/components/features/app/sidebar/secondary/secondary";
import { NavUser } from "@/zap/components/features/app/sidebar/user/user";
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

  if (!data?.user) return null;

  const { email, name, image } = data.user;
  const userData = { email, name, avatar: image ?? null };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
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
        <NavMain items={MAIN_NAV_ITEMS} />
        <NavSecondary className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
