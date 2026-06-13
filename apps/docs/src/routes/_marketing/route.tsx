import { Outlet, createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import { baseOptions, homeLinks } from "@/lib/layout/layout.shared";
import { FooterSection } from "@/routes/_marketing/-components/footer-section";

const MarketingLayout = () => (
  <HomeLayout {...baseOptions()} links={homeLinks()}>
    <Outlet />
    <FooterSection />
  </HomeLayout>
);

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});
