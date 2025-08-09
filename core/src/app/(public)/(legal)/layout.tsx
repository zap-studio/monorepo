import type React from "react";

import { Footer } from "@/zap-old/components/common/footer";
import { Header } from "@/zap-old/components/common/header";

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-24">{children}</div>
      <Footer />
    </div>
  );
}
