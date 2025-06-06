"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { authClient } from "@/zap/lib/auth/client";
import {
  useSidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Effect } from "effect";

type NavUserProps = {
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
};

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
};

const upgradeItem: MenuItem[] = [{ label: "Upgrade to Pro", icon: Sparkles }];

const accountItems: MenuItem[] = [
  { label: "Account", icon: BadgeCheck, href: "/app/account" },
  { label: "Billing", icon: CreditCard, href: "/app/billing" },
  { label: "Notifications", icon: Bell, href: "/app/notifications" },
];

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const fallback = getInitials(user.name);

  const handleSignOut = async () => {
    await Effect.tryPromise({
      try: () => authClient.signOut(),
      catch: () => ({ error: true }),
    })
      .pipe(
        Effect.match({
          onSuccess: () => {
            toast.success("Successfully signed out");
            router.push("/login");
          },
          onFailure: () => {
            toast.error("Failed to sign out");
          },
        }),
      )
      .pipe(Effect.runPromise)
      .catch(() => toast.error("Failed to sign out"));
  };

  const UserInfo = () => (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={user.avatar ?? ""} alt={user.name} />
        <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </>
  );

  const renderItems = (items: MenuItem[]) =>
    items.map(({ label, icon: Icon, href, onClick }) =>
      href ? (
        <DropdownMenuItem asChild key={label}>
          <Link href={href}>
            <Icon />
            {label}
          </Link>
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem key={label} onClick={onClick}>
          <Icon />
          {label}
        </DropdownMenuItem>
      ),
    );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserInfo />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserInfo />
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>{renderItems(upgradeItem)}</DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>{renderItems(accountItems)}</DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {renderItems([
                { label: "Log out", icon: LogOut, onClick: handleSignOut },
              ])}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
