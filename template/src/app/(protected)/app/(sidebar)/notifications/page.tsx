import { getAuthServerDataOrRedirectToLoginService } from "@/zap/auth/services";

export default async function NotificationsPage() {
  await getAuthServerDataOrRedirectToLoginService();

  return null;
}
