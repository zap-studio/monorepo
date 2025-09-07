import { _LegalPage } from "@/zap/legal/pages/legal.page";
import { generateLegalMetadata } from "@/zap/legal/utils";

const SLUG = "terms-of-service";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function TermsOfServicePage() {
  return <_LegalPage slug={SLUG} />;
}
