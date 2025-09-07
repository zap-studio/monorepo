import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";

export default async function AccountPage() {
  await getAuthServerDataOrRedirectToLoginService();

  return null;
}
