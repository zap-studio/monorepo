import { RiDiscordFill } from '@remixicon/react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowBigRight, ArrowUpRight } from 'lucide-react';
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
          icon: <ArrowBigRight />,
          text: 'Discussions',
          url: 'https://github.com/alexandretrotel/zap.ts/discussions',
        },
        {
          type: 'icon',
          icon: <RiDiscordFill />,
          text: 'Discord',
          url: 'https://discord.gg/24hXMC3eAa',
        },
        {
          icon: <ArrowUpRight />,
          text: 'Demo',
          url: 'https://demo.zap-ts.alexandretrotel.org',
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
