import "server-only";

import { getServerPlugin } from "@/lib/zap.server";
import { _BlogLayout } from "@/zap/blog/layouts/blog.layout";

const auth = getServerPlugin("auth");
const blog = getServerPlugin("blog");

type BlogLayoutProps = {
  children: React.ReactNode;
};

export default function BlogLayout({ children }: BlogLayoutProps) {
  return <_BlogLayout plugins={{ auth, blog }}>{children}</_BlogLayout>;
}
