import '@/app/global.css';
import { Geist as Font } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
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
        <Provider>
          {children} <Toaster />
        </Provider>
      </body>
    </html>
  );
}
