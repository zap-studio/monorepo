import { _SuccessPage, type _SuccessPageProps } from '@/zap/payments/pages';

export default async function SuccessPage({ searchParams }: _SuccessPageProps) {
  return <_SuccessPage searchParams={searchParams} />;
}
