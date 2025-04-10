"use client";

import * as React from "react";
import Link from "next/link";
import { HelpCircle, Home, Settings } from "lucide-react";

import { NavMain } from "@/components/zap/app/nav-main";
import { NavUser } from "@/components/zap/app/nav-user";
import { NavSecondary } from "./nav-secondary";
import { authClient } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const MAIN_NAV_ITEMS = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
];

const SECONDARY_NAV_ITEMS = [
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
  {
    title: "Give Feedback",
    url: "/app/feedback",
    icon: HelpCircle,
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
        <NavSecondary items={SECONDARY_NAV_ITEMS} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
