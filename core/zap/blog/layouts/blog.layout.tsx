import { Footer } from "../../components/common/footer";
import { Header } from "../../components/common/header";

export interface _BlogLayoutProps {
  children: React.ReactNode;
}

export function _BlogLayout({ children }: _BlogLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4">{children}</main>
      <Footer />
    </div>
  );
}
