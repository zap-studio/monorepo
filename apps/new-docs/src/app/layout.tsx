import '@/app/global.css';
import { Geist as Font } from 'next/font/google';
import type { ReactNode } from 'react';
import { Provider } from './provider';

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
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
