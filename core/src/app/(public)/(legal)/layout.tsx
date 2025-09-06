import _LegalLayout, {
  type _LegalLayoutProps,
} from "@/zap/legal/layouts/legal.layout";

export default function LegalLayout({ children }: _LegalLayoutProps) {
  return <_LegalLayout>{children}</_LegalLayout>;
}
