import { _WaitlistPage } from "@/zap/waitlist/pages";

export const revalidate = 60;

export default async function WaitlistPage() {
  return <_WaitlistPage />;
}
