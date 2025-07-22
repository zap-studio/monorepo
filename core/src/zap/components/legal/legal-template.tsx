import { CustomMDX } from "@/zap/components/blog/mdx";
import { getMdxContent } from "@/zap/lib/legal/utils";

interface LegalPageProps {
  slug: string;
}

export async function LegalPage({ slug }: LegalPageProps) {
  const { content } = await getMdxContent(slug);
  return (
    <div className="container mx-auto max-w-3xl">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <CustomMDX source={content} />
      </article>
    </div>
  );
}
