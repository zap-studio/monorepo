import type { Metadata } from "next";

import { _BlogPage, _metadata } from "@/zap/blog/pages";

export const metadata: Metadata = _metadata;

export default async function BlogPage() {
  return <_BlogPage />;
}
