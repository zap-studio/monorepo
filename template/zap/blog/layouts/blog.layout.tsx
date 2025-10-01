import type { ZapServerPluginInstance } from "@/lib/zap.server";
import { Footer } from "@/zap/components/common/footer";
import { Header } from "@/zap/components/common/header";

export type _BlogLayoutProps = {
  children: React.ReactNode;
  plugins: Partial<{
    auth: ZapServerPluginInstance<"auth">;
    blog: ZapServerPluginInstance<"blog">;
  }>;
};

export function _BlogLayout({ children, plugins }: _BlogLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header plugins={plugins} />
      <main className="flex-1 px-4">{children}</main>
      <Footer plugins={plugins} />
    </div>
  );
}
