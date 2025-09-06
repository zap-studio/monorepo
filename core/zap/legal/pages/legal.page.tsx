import { CustomMDX } from "@/zap/markdown/mdx";

import { getLegalContent } from "../utils";

type LegalPageProps = {
  slug: string;
};

export async function _LegalPage({ slug }: LegalPageProps) {
  const { content } = await getLegalContent(slug);
  return (
    <div className="container mx-auto max-w-3xl">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <CustomMDX source={content} />
      </article>
    </div>
  );
}
