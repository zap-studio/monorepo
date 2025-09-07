export type PWAPluginConfig = {
  BACKGROUND_COLOR: string;
  DESCRIPTION: string;
  ICONS: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
  NAME: string;
  SHORT_NAME: string;
  START_URL: string;
  THEME_COLOR: string;
  VAPID_MAIL?: string;
};
