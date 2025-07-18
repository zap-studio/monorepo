import {
  generateLegalMetadata,
  LegalPage,
} from "@/zap/components/legal/legal-template";

const SLUG = "terms-of-service";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function TermsOfServicePage() {
  return <LegalPage slug={SLUG} />;
}
