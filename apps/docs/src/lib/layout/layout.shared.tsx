import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from "fumadocs-ui/layouts/home/navbar";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import {
  BadgeCheckIcon,
  BotIcon,
  GlobeIcon,
  LockIcon,
  PackageIcon,
  RefreshCcwIcon,
  WebhookIcon,
} from "lucide-react";
import type { ReactNode } from "react";

function NavTitle(): ReactNode {
  return <span className="font-serif text-lg tracking-tight">Zap Studio</span>;
}

function NavbarMenuItemContent({
  description,
  icon,
  text,
}: {
  description: string;
  icon: ReactNode;
  text: string;
}): ReactNode {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-fd-primary">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">{text}</p>
        <p className="text-xs text-fd-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export const gitConfig = {
  branch: "main",
  repo: "monorepo",
  user: "zap-studio",
};

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    nav: {
      title: <NavTitle />,
    },
  };
}

export function homeLinks(): BaseLayoutProps["links"] {
  return [
    ...(baseOptions().links ?? []),
    // ── Mobile-only links ───────────────────────────────────────────
    {
      active: "nested-url",
      icon: <PackageIcon className="size-4" />,
      on: "menu",
      text: "Packages",
      url: "/docs/packages/fetch",
    },
    // ── Desktop-only animated menus ─────────────────────────────────
    {
      children: (
        <NavbarMenu>
          <NavbarMenuTrigger>Packages</NavbarMenuTrigger>
          <NavbarMenuContent>
            <NavbarMenuLink href="/docs/packages/fetch">
              <NavbarMenuItemContent
                description="Type-safe fetch wrapper with Standard Schema validation."
                icon={<GlobeIcon className="size-4" />}
                text="fetch"
              />
            </NavbarMenuLink>
            <NavbarMenuLink href="/docs/packages/permit">
              <NavbarMenuItemContent
                description="Declarative authorization library with composable conditions."
                icon={<LockIcon className="size-4" />}
                text="permit"
              />
            </NavbarMenuLink>
            <NavbarMenuLink href="/docs/packages/retry">
              <NavbarMenuItemContent
                description="Composable retry policies with fixed and exponential backoff."
                icon={<RefreshCcwIcon className="size-4" />}
                text="retry"
              />
            </NavbarMenuLink>
            <NavbarMenuLink href="/docs/packages/validation">
              <NavbarMenuItemContent
                description="Standard Schema utilities and ValidationError helpers."
                icon={<BadgeCheckIcon className="size-4" />}
                text="validation"
              />
            </NavbarMenuLink>
            <NavbarMenuLink href="/docs/packages/webhooks">
              <NavbarMenuItemContent
                description="Schema-first webhook routing with verification and lifecycle hooks."
                icon={<WebhookIcon className="size-4" />}
                text="webhooks"
              />
            </NavbarMenuLink>
          </NavbarMenuContent>
        </NavbarMenu>
      ),
      on: "nav",
      type: "custom",
    },
    // ── Shared links (both desktop and mobile) ──────────────────────
    {
      children: (
        <NavbarMenu>
          <NavbarMenuTrigger>llms.txt</NavbarMenuTrigger>
          <NavbarMenuContent>
            <NavbarMenuLink href="/llms.txt">
              <NavbarMenuItemContent
                description="Compact index of all documentation pages."
                icon={<GlobeIcon className="size-4" />}
                text="llms.txt"
              />
            </NavbarMenuLink>
            <NavbarMenuLink href="/llms-full.txt">
              <NavbarMenuItemContent
                description="Full content of all documentation pages."
                icon={<GlobeIcon className="size-4" />}
                text="llms-full.txt"
              />
            </NavbarMenuLink>
          </NavbarMenuContent>
        </NavbarMenu>
      ),
      on: "nav",
      type: "custom",
    },
    // ── Mobile-only llms.txt (last) ─────────────────────────────────
    {
      icon: <BotIcon className="size-4" />,
      on: "menu",
      text: "llms.txt",
      url: "/llms.txt",
    },
  ];
}
