"use client";

import { Crown } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { isPluginEnabled } from "@/lib/plugins";
import { betterAuthClient } from "@/zap/auth/providers/better-auth/client";
import { useActiveSubscriptionProduct } from "@/zap/payments/providers/polar/client";

import { MAIN_NAV_ITEMS } from "../data";
import { SidebarMainSection } from "./sidebar-main-section";
import { SidebarSecondarySection } from "./sidebar-secondary-section";
import { SidebarUser } from "./sidebar-user";

type AppSidebarProps = {
  props?: React.ComponentProps<typeof Sidebar>;
};

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { data } = betterAuthClient.useSession();
  const product = useActiveSubscriptionProduct();

  const isAuthEnabled = useMemo(() => isPluginEnabled("auth"), []);

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
              <Link
                className="flex items-center justify-between gap-2"
                href="/"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Zap.ts ⚡️</span>
                </div>

                {product && (
                  <Badge className="hidden md:inline-flex">
                    <Crown />
                    {product.name.split(" ")[0]}
                  </Badge>
                )}
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
        {isAuthEnabled && <SidebarUser user={userData} />}
      </SidebarFooter>
    </Sidebar>
  );
}
