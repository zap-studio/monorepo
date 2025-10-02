import "server-only";

import { getServerPlugin } from "@/lib/zap.server";
import { _LegalLayout } from "@/zap/legal/layouts/legal.layout";

const auth = getServerPlugin("auth");
const blog = getServerPlugin("blog");

type LegalLayoutProps = {
  children: React.ReactNode;
};

export default function LegalLayout({ children }: LegalLayoutProps) {
  return <_LegalLayout plugins={{ auth, blog }}>{children}</_LegalLayout>;
}
