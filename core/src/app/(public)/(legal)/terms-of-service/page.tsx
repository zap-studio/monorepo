import { LegalPage } from "@/zap/components/legal/legal-template";
import { generateLegalMetadata } from "@/zap/lib/legal/utils";

const SLUG = "terms-of-service";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function TermsOfServicePage() {
  return <LegalPage slug={SLUG} />;
}
