import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Geist as Font } from 'next/font/google';
import type { ReactNode } from 'react';

const font = Font({
  subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${font.className} antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
