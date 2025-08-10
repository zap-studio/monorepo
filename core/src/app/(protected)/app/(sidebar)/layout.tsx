import { _AppLayout } from "@/zap/sidebar/layouts";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <_AppLayout>{children}</_AppLayout>;
}
