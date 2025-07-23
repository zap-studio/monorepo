import { headers } from "next/headers";

import { getAuthDataOrRedirectToLogin } from "@/zap/lib/auth/redirects";

export default async function SettingsPage() {
  const _headers = await headers();
  await getAuthDataOrRedirectToLogin(_headers);

  return <></>;
}
