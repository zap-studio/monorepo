import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";

export default async function SettingsPage() {
  await getAuthServerDataOrRedirectToLoginService();

  return null;
}
