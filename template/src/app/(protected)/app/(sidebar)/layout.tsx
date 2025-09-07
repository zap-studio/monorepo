import {
  _AppLayout,
  type _AppLayoutProps,
} from "@/zap/sidebar/layouts/app.layout";

export default function AppLayout({ children }: _AppLayoutProps) {
  return <_AppLayout>{children}</_AppLayout>;
}
