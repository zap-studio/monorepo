import "server-only";

import type { Metadata } from "next";
import { getServerPluginConfig } from "@/lib/zap.server";
import { _BlogPage, _metadata } from "@/zap/blog/pages/blog.page";

export const metadata: Metadata = _metadata;

const blogConfig = getServerPluginConfig("blog") ?? {};

export default function BlogPage() {
  return <_BlogPage pluginConfigs={{ blog: blogConfig }} />;
}
