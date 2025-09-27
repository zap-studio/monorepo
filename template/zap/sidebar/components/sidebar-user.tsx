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
import { useMemo } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { isPluginEnabled } from "@/lib/plugins";
import { betterAuthClient } from "@/zap/auth/providers/better-auth/client";
import { handleClientError } from "@/zap/errors/client";
import { useActiveSubscriptionProduct } from "@/zap/payments/providers/polar/client";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

type SidebarUserProps = {
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
};

export function SidebarUser({ user }: SidebarUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const product = useActiveSubscriptionProduct();

  const isPaymentsEnabled = useMemo(() => isPluginEnabled("payments"), []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const fallback = getInitials(user.name);

  const handleCustomerPortal = async () => {
    try {
      toast.loading("Redirecting to customer portal...");
      await betterAuthClient.customer.portal();
    } catch (error) {
      handleClientError(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await betterAuthClient.signOut();
      toast.success("Successfully signed out");
      router.push("/login");
    } catch (error) {
      handleClientError(error);
    }
  };

  const UPGRADE_ITEM: MenuItem[] = [
    {
      label: "Upgrade to Pro",
      icon: Sparkles,
      href: "/app/billing",
      disabled: !isPaymentsEnabled,
    },
  ];

  const ACCOUNT_ITEMS: MenuItem[] = [
    { label: "Account", icon: BadgeCheck, href: "/app/account" },
    {
      label: "Billing",
      icon: CreditCard,
      onClick: handleCustomerPortal,
      disabled: !isPaymentsEnabled,
    },
    { label: "Notifications", icon: Bell, href: "/app/notifications" },
  ];

  const ACTION_ITEMS: MenuItem[] = [
    { label: "Log out", icon: LogOut, onClick: handleSignOut },
  ];

  const renderMenuItems = (items: MenuItem[]) =>
    items
      .map(({ label, icon: Icon, href, onClick, disabled }) => {
        if (disabled) {
          return null;
        }

        if (label === "Billing" && !product) {
          return null;
        }

        if (href) {
          return (
            <DropdownMenuItem asChild key={label}>
              <Link href={{ pathname: href }}>
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

type User = {
  name: string;
  email: string;
  avatar: string | null;
};

type UserInfoProps = {
  user: User;
  fallback: string;
};

function UserInfo({ user, fallback }: UserInfoProps) {
  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage alt={user.name} src={user.avatar ?? ""} />
        <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
      </Avatar>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </>
  );
}
