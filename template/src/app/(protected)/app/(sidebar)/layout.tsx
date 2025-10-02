import "server-only";

import { _AppLayout } from "@/zap/sidebar/layouts/app.layout";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <_AppLayout>{children}</_AppLayout>;
}
