import { _LandingPage } from "@/zap/landing/pages";

export const revalidate = 3600; // revalidate every hour

export default function LandingPage() {
  return <_LandingPage />;
}
