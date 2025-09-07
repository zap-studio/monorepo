import { _LegalPage } from "@/zap/legal/pages/legal.page";
import { generateLegalMetadata } from "@/zap/legal/utils";

const SLUG = "privacy-policy";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function PrivacyPolicyPage() {
  return <_LegalPage slug={SLUG} />;
}
