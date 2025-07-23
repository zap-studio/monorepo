import { headers } from "next/headers";

import { getAuthDataOrRedirectToLogin } from "@/zap/lib/auth/redirects";

export default async function NotificationsPage() {
  const _headers = await headers();
  const result = await getAuthDataOrRedirectToLogin(_headers);

  return <></>;
}
