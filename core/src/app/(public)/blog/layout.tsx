import { Footer } from "@/zap/components/common/footer";
import { Navbar } from "@/zap/components/common/header";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4">{children}</main>
      <Footer />
    </div>
  );
}
