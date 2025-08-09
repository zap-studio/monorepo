import { getLegalContent } from "@/zap/legal/utils";
import { CustomMDX } from "@/zap/markdown/mdx";

interface LegalPageProps {
  slug: string;
}

export async function LegalPage({ slug }: LegalPageProps) {
  const { content } = await getLegalContent(slug);
  return (
    <div className="container mx-auto max-w-3xl">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <CustomMDX source={content} />
      </article>
    </div>
  );
}
