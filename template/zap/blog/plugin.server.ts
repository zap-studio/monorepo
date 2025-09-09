import type { AnyComponent, ZapServerPlugin } from "@/zap/plugins/types";
import type { BlogServerPluginConfig } from "@/zap/plugins/types/blog.plugin";
import { checkBlogPathAccess } from "./authorization";
import { LatestBlogPosts } from "./components/latest-blog-posts";
import { PostMetadataSchema } from "./schemas";
import {
  formatDate,
  generateBlogPostMetadata,
  getBlogPost,
  getBlogPosts,
  getBlogPostsMetadata,
  getMDXData,
  getMDXFiles,
  parseFrontmatter,
  readMDXFile,
} from "./utils";

export function blogPlugin(
  config?: Partial<BlogServerPluginConfig>
): ZapServerPlugin<
  "blog",
  BlogServerPluginConfig,
  Record<string, unknown>,
  Record<string, AnyComponent>,
  { PostMetadataSchema: typeof PostMetadataSchema },
  {
    parseFrontmatter: typeof parseFrontmatter;
    getMDXFiles: typeof getMDXFiles;
    readMDXFile: typeof readMDXFile;
    getMDXData: typeof getMDXData;
    getBlogPosts: typeof getBlogPosts;
    getBlogPostsMetadata: typeof getBlogPostsMetadata;
    getBlogPost: typeof getBlogPost;
    formatDate: typeof formatDate;
    generateBlogPostMetadata: typeof generateBlogPostMetadata;
  },
  Record<string, unknown>,
  Record<string, unknown>,
  { checkBlogPathAccess: typeof checkBlogPathAccess },
  {
    LatestBlogPosts: typeof LatestBlogPosts;
  }
> {
  return {
    id: "blog",
    config,
    schemas: {
      PostMetadataSchema,
    },
    utils: {
      parseFrontmatter,
      getMDXFiles,
      readMDXFile,
      getMDXData,
      getBlogPosts,
      getBlogPostsMetadata,
      getBlogPost,
      formatDate,
      generateBlogPostMetadata,
    },
    middleware: {
      checkBlogPathAccess,
    },
    components: {
      LatestBlogPosts,
    },
  } satisfies ZapServerPlugin<"blog">;
}
