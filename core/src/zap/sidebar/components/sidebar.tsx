"use client";

import { Crown } from "lucide-react";
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
import type { ProductMetadata } from "@/zap.config";
import { betterAuthClient } from "@/zap/auth/providers/better-auth/client";
import { useActiveSubscriptionProduct } from "@/zap/payments/providers/polar/client";
import {
  SidebarMainSection,
  SidebarSecondarySection,
  SidebarUser,
} from "@/zap/sidebar/components";
import { MAIN_NAV_ITEMS } from "@/zap/sidebar/data";

interface AppSidebarProps {
  props?: React.ComponentProps<typeof Sidebar>;
  products?: ProductMetadata[];
}

export function AppSidebar({ products, ...props }: AppSidebarProps) {
  const { data } = betterAuthClient.useSession();
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
        <SidebarUser products={products} user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
