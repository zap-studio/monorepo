import type { Metadata } from "next";

import { _BlogPage, _metadata } from "@/zap/blog/pages/blog.page";

export const metadata: Metadata = _metadata;

export default function BlogPage() {
  return <_BlogPage />;
}
