import type {
  ComponentMap,
  IntegrationsMap,
  TypesMap,
  ZapServerPlugin,
  ZodSchemaMap,
} from "@/zap/plugins/types";
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
  IntegrationsMap,
  ComponentMap,
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
  TypesMap,
  ZodSchemaMap,
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
