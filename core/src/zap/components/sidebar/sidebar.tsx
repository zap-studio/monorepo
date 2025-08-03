"use client";

import { Crown, Home } from "lucide-react";
import Link from "next/link";
import type React from "react";

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
import { SidebarMainSection } from "@/zap/components/sidebar/sidebar-main-section";
import { SidebarSecondarySection } from "@/zap/components/sidebar/sidebar-secondary-section";
import { SidebarUser } from "@/zap/components/sidebar/sidebar-user";
import { authClient } from "@/zap/lib/auth/client";
import { useActiveSubscriptionProduct } from "@/zap/lib/polar/client";
import { type ProductMetadata } from "@/zap/lib/polar/utils";

const MAIN_NAV_ITEMS = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
];

interface AppSidebarProps {
  props?: React.ComponentProps<typeof Sidebar>;
  products?: ProductMetadata[];
}

export function AppSidebar({ products, ...props }: AppSidebarProps) {
  const { data } = authClient.useSession();
  const product = useActiveSubscriptionProduct(products);

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
                href="/"
                className="flex items-center justify-between gap-2"
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
        <SidebarUser user={userData} products={products} />
      </SidebarFooter>
    </Sidebar>
  );
}
