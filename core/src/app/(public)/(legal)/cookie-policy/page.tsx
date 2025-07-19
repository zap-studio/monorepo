import { LegalPage } from "@/zap/components/legal/legal-template";
import { generateLegalMetadata } from "@/zap/lib/legal/utils";

const SLUG = "cookie-policy";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function CookiePolicyPage() {
  return <LegalPage slug={SLUG} />;
}
