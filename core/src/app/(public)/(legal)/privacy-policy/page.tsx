import { LegalPage } from "@/zap/legal/pages";
import { generateLegalMetadata } from "@/zap/legal/utils";

const SLUG = "privacy-policy";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function PrivacyPolicyPage() {
  return <LegalPage slug={SLUG} />;
}
