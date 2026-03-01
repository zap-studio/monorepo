import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html className={geist.className} lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
