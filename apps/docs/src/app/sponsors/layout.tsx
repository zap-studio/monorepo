import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { FooterSection } from "@/app/(home)/_components/footer-section";
import { baseOptions, homeLinks } from "@/lib/layout.shared";

export default function Layout({
  children,
}: LayoutProps<"/sponsors">): ReactNode {
  return (
    <HomeLayout
      {...baseOptions()}
      links={homeLinks({ sponsorsActiveMode: "url" })}
    >
      {children}
      <FooterSection />
    </HomeLayout>
  );
}
