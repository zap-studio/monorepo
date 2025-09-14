import type {
  AIClientPluginConfig,
  AIServerPluginConfig,
} from "../types/ai.plugin";
import type {
  AnalyticsClientPluginConfig,
  AnalyticsServerPluginConfig,
} from "../types/analytics.plugin";
import type {
  AuthClientPluginConfig,
  AuthServerPluginConfig,
} from "../types/auth.plugin";
import type {
  BlogClientPluginConfig,
  BlogServerPluginConfig,
} from "../types/blog.plugin";

export type DefaultConfig = {
  ai: Partial<AIClientPluginConfig | AIServerPluginConfig>;
  analytics: Partial<AnalyticsClientPluginConfig | AnalyticsServerPluginConfig>;
  auth: Partial<AuthClientPluginConfig | AuthServerPluginConfig>;
  blog: Partial<BlogClientPluginConfig | BlogServerPluginConfig>;
};
