import { RiDiscordFill } from "@remixicon/react";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  DEMO_URL,
  DISCORD_URL,
  GITHUB_DISCUSSIONS_URL,
} from "@/constants/website";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        {
          text: "Documentation",
          url: "/docs",
        },
        {
          icon: <ArrowUpRight />,
          text: "Discussions",
          url: GITHUB_DISCUSSIONS_URL,
        },
        {
          icon: <ArrowUpRight />,
          text: "Demo",
          url: DEMO_URL,
        },
        {
          type: "icon",
          icon: <RiDiscordFill />,
          text: "Discord",
          url: DISCORD_URL,
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
