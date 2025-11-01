import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { DEMO_URL } from "@/data/website";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      links={[
        {
          text: "Demo",
          url: DEMO_URL,
          icon: <ArrowUpRight />,
        },
      ]}
      nav={{ ...baseOptions.nav }}
      tree={source.pageTree}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}
