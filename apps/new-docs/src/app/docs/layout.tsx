import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      links={[
        {
          text: 'Demo',
          url: 'https://demo.zap-ts.alexandretrotel.org',
          icon: <ArrowUpRight />,
        },
      ]}
      nav={{ ...baseOptions.nav }}
      tree={source.pageTree}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}
