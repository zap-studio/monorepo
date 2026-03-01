import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions, homeLinks } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">): ReactNode {
  return (
    <HomeLayout {...baseOptions()} links={homeLinks()}>
      {children}
    </HomeLayout>
  );
}
