import { getServerPlugin } from "@/lib/zap.server";
import _LegalLayout, {
  type _LegalLayoutProps,
} from "@/zap/legal/layouts/legal.layout";

const auth = getServerPlugin("auth");
const blog = getServerPlugin("blog");

export default function LegalLayout({ children }: _LegalLayoutProps) {
  return <_LegalLayout plugins={{ auth, blog }}>{children}</_LegalLayout>;
}
