import {
  generateLegalMetadata,
  LegalPage,
} from "@/zap/components/legal/legal-template";

const SLUG = "privacy-policy";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function PrivacyPolicyPage() {
  return <LegalPage slug={SLUG} />;
}
