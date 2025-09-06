import { _LandingPage } from "@/zap/landing/pages/landing.page";

export const revalidate = 3600; // revalidate every hour

export default function LandingPage() {
  return <_LandingPage />;
}
