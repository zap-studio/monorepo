import { Footer } from "@/zap/components/common/footer";
import { Header } from "@/zap/components/common/header";

export type _BlogLayoutProps = {
  children: React.ReactNode;
};

export function _BlogLayout({ children }: _BlogLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4">{children}</main>
      <Footer />
    </div>
  );
}
