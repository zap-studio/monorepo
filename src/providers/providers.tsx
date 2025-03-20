"use client";

// ZAP_PLUGIN:pwa:START
import { usePushNotificationsStore } from "../stores/push-notifications.store";
// ZAP_PLUGIN:pwa:END
import { ThemeProvider } from "./theme.provider";
import { useEffect } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // ZAP_PLUGIN:pwa:START
  const initialize = usePushNotificationsStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);
  // ZAP_PLUGIN:pwa:END

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
