import {
  generateLegalMetadata,
  LegalPage,
} from "@/zap/components/legal/legal-template";

const SLUG = "cookie-policy";

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function CookiePolicyPage() {
  return <LegalPage slug={SLUG} />;
}
