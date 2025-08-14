import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Geist } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Geist({
  subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html className={inter.className} lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
