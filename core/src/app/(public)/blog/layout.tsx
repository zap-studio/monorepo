import { Footer } from "@/zap-old/components/common/footer";
import { Header } from "@/zap-old/components/common/header";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4">{children}</main>
      <Footer />
    </div>
  );
}
