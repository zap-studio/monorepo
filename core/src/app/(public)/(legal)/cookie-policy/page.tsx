import { _LegalPage } from '@/zap/legal/pages';
import { generateLegalMetadata } from '@/zap/legal/utils';

const SLUG = 'cookie-policy';

export const generateMetadata = () => generateLegalMetadata(SLUG);

export default function CookiePolicyPage() {
  return <_LegalPage slug={SLUG} />;
}
