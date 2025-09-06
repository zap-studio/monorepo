import {
  _BlogLayout,
  type _BlogLayoutProps,
} from "@/zap/blog/layouts/blog.layout";

export default function BlogLayout({ children }: _BlogLayoutProps) {
  return <_BlogLayout>{children}</_BlogLayout>;
}
