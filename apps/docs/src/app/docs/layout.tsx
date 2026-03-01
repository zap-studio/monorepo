import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">): ReactNode {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      links={[]}
      sidebar={{
        tabs: {
          transform: (option, node) => ({
            ...option,
            icon: node.icon ? (
              <span className="flex size-full items-center justify-center text-fd-primary [&_svg]:size-4">
                {node.icon}
              </span>
            ) : undefined,
            description: undefined,
          }),
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
