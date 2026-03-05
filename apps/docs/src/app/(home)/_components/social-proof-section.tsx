import {
  BoxIcon,
  CircleDotIcon,
  HammerIcon,
  PackageIcon,
  StarIcon,
  TagIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { FadeIn, StaggerContainer, StaggerItem } from "./animated";
import { TypeScriptIcon } from "./icons";

const RELEASES_LAST_PAGE_RE = /page=(\d+)>; rel="last"/;

interface GitHubStats {
  issues: number;
  releases: number;
  stars: number;
}

async function fetchGitHubStats(): Promise<GitHubStats> {
  try {
    const [repoRes, releasesRes] = await Promise.all([
      fetch("https://api.github.com/repos/zap-studio/monorepo", {
        next: { revalidate: 3600 },
        headers: { Accept: "application/vnd.github+json" },
      }),
      fetch(
        "https://api.github.com/repos/zap-studio/monorepo/releases?per_page=1",
        {
          next: { revalidate: 3600 },
          headers: { Accept: "application/vnd.github+json" },
        }
      ),
    ]);

    if (!(repoRes.ok && releasesRes.ok)) {
      return { stars: 153, issues: 0, releases: 12 };
    }

    const repo = await repoRes.json();

    const linkHeader = releasesRes.headers.get("link") ?? "";
    const match = linkHeader.match(RELEASES_LAST_PAGE_RE);
    const releases = match ? Number.parseInt(match[1], 10) : 12;

    return {
      stars: repo.stargazers_count as number,
      issues: repo.open_issues_count as number,
      releases,
    };
  } catch {
    return { stars: 153, issues: 0, releases: 12 };
  }
}

const technologies: TechBadge[] = [
  {
    icon: <TypeScriptIcon className="size-3.5" />,
    name: "TypeScript",
  },
  {
    icon: <BoxIcon className="size-3.5" />,
    name: "Standard Schema",
  },
  {
    icon: <HammerIcon className="size-3.5" />,
    name: "tsdown",
  },
];

export async function SocialProofSection(): Promise<ReactNode> {
  const { stars, issues, releases } = await fetchGitHubStats();

  const stats: StatItem[] = [
    {
      icon: <StarIcon className="size-4" />,
      value: stars.toLocaleString(),
      label: "GitHub Stars",
    },
    {
      icon: <CircleDotIcon className="size-4" />,
      value: issues.toLocaleString(),
      label: "Open Issues",
    },
    {
      icon: <TagIcon className="size-4" />,
      value: releases.toLocaleString(),
      label: "Releases",
    },
    {
      icon: <PackageIcon className="size-4" />,
      value: "3",
      label: "Packages",
    },
  ];

  return (
    <section className="relative border-fd-border border-b bg-fd-card/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-fd-primary/20 to-transparent"
      />

      <div className="mx-auto max-w-5xl px-6 py-14 md:py-24">
        <FadeIn delay={0} duration={0.5} y={12}>
          <p className="mb-8 text-center font-mono text-fd-muted-foreground text-xs uppercase leading-5 tracking-widest md:mb-12">
            Built for production
          </p>
        </FadeIn>

        <StaggerContainer
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          delay={0.1}
          stagger={0.1}
        >
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.4} duration={0.6} y={0}>
          <div className="mx-auto my-8 h-px max-w-xs bg-linear-to-r from-transparent via-fd-border to-transparent md:my-12" />
        </FadeIn>

        <FadeIn delay={0.5} duration={0.5} y={10}>
          <div className="flex flex-col items-center gap-4">
            <p className="font-medium text-fd-muted-foreground/60 text-xs leading-5">
              Built with
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {technologies.map((tech) => (
                <TechBadgeItem
                  icon={tech.icon}
                  key={tech.name}
                  name={tech.name}
                />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-fd-primary/20 to-transparent"
      />
    </section>
  );
}

function StatCard({ icon, value, label }: StatItem): ReactNode {
  return (
    <div className="group relative flex flex-col items-center gap-2 rounded-2xl border border-fd-border/50 bg-fd-card/60 px-4 py-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-fd-primary/20 hover:bg-fd-card/80 hover:shadow-fd-primary/3 hover:shadow-lg sm:gap-3 sm:px-6 sm:py-8">
      <div className="flex size-10 items-center justify-center rounded-xl bg-fd-accent text-fd-primary transition-colors duration-300 group-hover:bg-fd-primary/15">
        {icon}
      </div>

      <span className="font-serif text-2xl text-fd-foreground leading-none tracking-tight sm:text-3xl md:text-4xl">
        {value}
      </span>

      <span className="font-mono text-fd-muted-foreground text-xs uppercase leading-5 tracking-wider">
        {label}
      </span>
    </div>
  );
}

interface StatItem {
  icon: ReactNode;
  label: string;
  value: string;
}

interface TechBadge {
  icon: ReactNode;
  name: string;
}

function TechBadgeItem({ icon, name }: TechBadge): ReactNode {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-fd-border/60 bg-fd-card/50 px-4 py-2 text-fd-muted-foreground backdrop-blur-sm transition-colors duration-300 hover:border-fd-primary/25 hover:text-fd-foreground">
      <span className="text-fd-primary">{icon}</span>
      <span className="font-medium text-xs leading-5">{name}</span>
    </div>
  );
}
