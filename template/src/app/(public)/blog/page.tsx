import type { Metadata } from "next";
import { getServerPluginConfig } from "@/lib/zap.server";
import { _BlogPage, _metadata } from "@/zap/blog/pages/blog.page";

export const metadata: Metadata = _metadata;

export default function BlogPage() {
  const blogConfig = getServerPluginConfig("blog") ?? {};
  return <_BlogPage pluginConfigs={{ blog: blogConfig }} />;
}
