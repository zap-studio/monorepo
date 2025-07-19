import { LegalPage } from "@/zap/components/legal/legal-template";
import { generateLegalMetadata } from "@/zap/lib/legal/utils";

const SLUG = "privacy-policy";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function PrivacyPolicyPage() {
  return <LegalPage slug={SLUG} />;
}
