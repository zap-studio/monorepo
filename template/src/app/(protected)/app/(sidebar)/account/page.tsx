import { getServerPlugin } from "@/lib/zap.server";
import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";

const authConfig = getServerPlugin("auth").config ?? {};

export default async function AccountPage() {
  await getAuthServerDataOrRedirectToLoginService(authConfig);

  return null;
}
