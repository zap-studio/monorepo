import { Outlet, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { FooterSection } from "@/routes/_marketing/-components/footer-section";
import { baseOptions, homeLinks } from "@/lib/layout/layout.shared";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    <HomeLayout {...baseOptions()} links={homeLinks()}>
      <Outlet />
      <FooterSection />
    </HomeLayout>
  );
}
