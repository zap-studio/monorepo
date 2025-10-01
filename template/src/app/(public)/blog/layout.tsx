import { getServerPlugin } from "@/lib/zap.server";
import {
  _BlogLayout,
  type _BlogLayoutProps,
} from "@/zap/blog/layouts/blog.layout";

const auth = getServerPlugin("auth");
const blog = getServerPlugin("blog");

export default function BlogLayout({ children }: _BlogLayoutProps) {
  return <_BlogLayout plugins={{ auth, blog }}>{children}</_BlogLayout>;
}
