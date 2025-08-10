import {
  _BlogSlugPage,
  _BlogSlugPageProps,
  _generateMetadata,
  _generateStaticParams,
} from "@/zap/blog/pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return await _generateMetadata({ params });
}

export async function generateStaticParams() {
  return await _generateStaticParams();
}

export default async function BlogSlugPage({ params }: _BlogSlugPageProps) {
  return <_BlogSlugPage params={params} />;
}
