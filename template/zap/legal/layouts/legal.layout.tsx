import type React from "react";
import type { ZapServerPluginInstance } from "@/lib/zap.server";
import { Footer } from "@/zap/components/common/footer";
import { Header } from "@/zap/components/common/header";

export type _LegalLayoutProps = {
  children: React.ReactNode;
  plugins: Partial<{
    auth: ZapServerPluginInstance<"auth">;
    blog: ZapServerPluginInstance<"blog">;
  }>;
};

export default function _LegalLayout({ children, plugins }: _LegalLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header plugins={plugins} />
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-24">{children}</div>
      <Footer plugins={plugins} />
    </div>
  );
}
