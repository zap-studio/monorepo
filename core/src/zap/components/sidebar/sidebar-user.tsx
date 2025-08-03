"use client";

import { useRouter } from "@bprogress/next/app";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  type LucideIcon,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserInfo } from "@/zap/components/sidebar/user-info";
import { authClient } from "@/zap/lib/auth/client";
import { useActiveSubscriptionProductId } from "@/zap/lib/polar/client";
import { getProduct, type ProductMetadata } from "@/zap/lib/polar/utils";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
};

interface SidebarUserProps {
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
  products?: ProductMetadata[];
}

export function SidebarUser({ user, products }: SidebarUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const productId = useActiveSubscriptionProductId();
  const product = getProduct({ products, productId });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const fallback = getInitials(user.name);

  const handleCustomerPortal = async () => {
    await authClient.customer.portal();
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Successfully signed out");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const UPGRADE_ITEM: MenuItem[] = [
    { label: "Upgrade to Pro", icon: Sparkles, href: "/app/billing" },
  ];

  const ACCOUNT_ITEMS: MenuItem[] = [
    { label: "Account", icon: BadgeCheck, href: "/app/account" },
    {
      label: "Billing",
      icon: CreditCard,
      onClick: handleCustomerPortal,
    },
    { label: "Notifications", icon: Bell, href: "/app/notifications" },
  ];

  const ACTION_ITEMS: MenuItem[] = [
    { label: "Log out", icon: LogOut, onClick: handleSignOut },
  ];

  const renderMenuItems = (items: MenuItem[]) => {
    return items
      .map(({ label, icon: Icon, href, onClick }) => {
        if (label === "Billing" && !product) {
          return null;
        }

        if (href) {
          return (
            <DropdownMenuItem asChild key={label}>
              <Link href={href}>
                <Icon className="mr-2 size-4" />
                {label}
              </Link>
            </DropdownMenuItem>
          );
        }

        return (
          <DropdownMenuItem key={label} onClick={onClick}>
            <Icon className="mr-2 size-4" />
            {label}
          </DropdownMenuItem>
        );
      })
      .filter((item) => item !== null);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <UserInfo fallback={fallback} user={user} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserInfo fallback={fallback} user={user} />
              </div>
            </DropdownMenuLabel>

            {!product && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  {renderMenuItems(UPGRADE_ITEM)}
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {renderMenuItems(ACCOUNT_ITEMS)}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {renderMenuItems(ACTION_ITEMS)}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
