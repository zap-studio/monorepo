import { getServerPluginConfig } from "@/lib/zap.server";
import {
  _BlogSlugPage,
  type _BlogSlugPageProps,
  _generateMetadata,
  _generateStaticParams,
} from "@/zap/blog/pages/slug.page";

const blogConfig = getServerPluginConfig("blog") ?? {};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return await _generateMetadata({
    params,
    pluginConfigs: { blog: blogConfig },
  });
}

export async function generateStaticParams() {
  return await _generateStaticParams({ blog: blogConfig });
}

export default function BlogSlugPage({ params }: _BlogSlugPageProps) {
  return <_BlogSlugPage params={params} pluginConfigs={{ blog: blogConfig }} />;
}
