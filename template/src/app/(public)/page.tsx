import { getServerPlugin } from "@/lib/zap.server";
import { _LandingPage } from "@/zap/landing/pages/landing.page";

export const revalidate = 3600; // revalidate every hour

const auth = getServerPlugin("auth");
const blog = getServerPlugin("blog");

export default function LandingPage() {
  return <_LandingPage plugins={{ auth, blog }} />;
}
