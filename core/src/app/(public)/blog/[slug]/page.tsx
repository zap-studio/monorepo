import type { Metadata } from "next";

import { ZAP_DEFAULT_METADATA } from "@/zap.config";

export const metadata: Metadata = {
  title: `${ZAP_DEFAULT_METADATA.title} | Blog`,
};

export default function BlogSlugPage() {
  return <div>slug</div>;
}
