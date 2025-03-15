"use client";

import ORPCProvider from "./orpc-provider";
import PushNotificationProvider from "./push-notifications-provider";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ORPCProvider>
        <PushNotificationProvider>{children}</PushNotificationProvider>
      </ORPCProvider>
    </ThemeProvider>
  );
}
