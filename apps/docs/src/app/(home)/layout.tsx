import { RiDiscordFill } from '@remixicon/react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      links={[
        {
          text: 'Documentation',
          url: '/docs',
        },
        {
          icon: <ArrowUpRight />,
          text: 'Discussions',
          url: 'https://github.com/zap-studio/zap.ts/discussions',
        },
        {
          icon: <ArrowUpRight />,
          text: 'Demo',
          url: 'https://demo.zap-ts.alexandretrotel.org',
        },
        {
          type: 'icon',
          icon: <RiDiscordFill />,
          text: 'Discord',
          url: 'https://discord.gg/24hXMC3eAa',
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
