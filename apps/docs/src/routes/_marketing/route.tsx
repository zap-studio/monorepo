import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { FooterSection } from "@/routes/_marketing/-components/footer-section";
import { baseOptions, homeLinks } from "@/lib/layout/layout.shared";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});

function MarketingLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <HomeLayout
      {...baseOptions()}
      links={pathname === "/sponsors" ? homeLinks({ sponsorsActiveMode: "url" }) : homeLinks()}
    >
      <Outlet />
      <FooterSection />
    </HomeLayout>
  );
}
