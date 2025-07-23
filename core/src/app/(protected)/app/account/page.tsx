import { headers } from "next/headers";

import { getAuthDataOrRedirectToLogin } from "@/zap/lib/auth/redirects";

export default async function AccountPage() {
  const _headers = await headers();
  const result = await getAuthDataOrRedirectToLogin(_headers);

  return <></>;
}
