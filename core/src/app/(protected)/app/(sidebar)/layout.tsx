import { _AppLayout, _AppLayoutProps } from "@/zap/sidebar/layouts";

export default async function AppLayout({ children }: _AppLayoutProps) {
  return <_AppLayout>{children}</_AppLayout>;
}
