import type { Provider } from "@/zap.config";

export interface ZapSettings {
  AI: {
    SYSTEM_PROMPT: string;
    CHAT?: {
      MAX_TOKENS?: number;
      TEMPERATURE?: number;
      PRESENCE_PENALTY?: number;
      FREQUENCY_PENALTY?: number;
      STOP_SEQUENCES?: string[];
      MAX_RETRIES?: number;
    };
    COMPLETION?: {
      MAX_TOKENS?: number;
      TEMPERATURE?: number;
      PRESENCE_PENALTY?: number;
      FREQUENCY_PENALTY?: number;
      STOP_SEQUENCES?: string[];
      MAX_RETRIES?: number;
    };
  };
  AUTH: {
    REQUIRE_MAIL_VERIFICATION: boolean;
    ENABLE_SOCIAL_PROVIDER: boolean;
    MINIMUM_USERNAME_LENGTH: number;
    MAXIMUM_USERNAME_LENGTH: number;
    MINIMUM_PASSWORD_LENGTH: number;
    MAXIMUM_PASSWORD_LENGTH: number;
    LOGIN_URL: string;
    REDIRECT_URL_AFTER_SIGN_UP: string;
    REDIRECT_URL_AFTER_SIGN_IN: string;
    PROVIDERS: Provider[];
    PASSWORD_COMPROMISED_MESSAGE: string;
    PUBLIC_PATHS: string[];
  };
  BLOG: {
    BASE_PATH: string;
  };
  MAIL: {
    PREFIX: string;
    RATE_LIMIT_SECONDS: number;
    FROM: string;
  };
  NOTIFICATIONS: {
    VAPID_MAIL?: string;
  };
  PWA: {
    NAME: string;
    SHORT_NAME: string;
    DESCRIPTION: string;
    START_URL: string;
    BACKGROUND_COLOR: string;
    THEME_COLOR: string;
    ICONS: Array<{
      src: string;
      sizes: string;
      type: string;
    }>;
  };
  SECURITY: {
    CSP: {
      DEFAULT_SRC: string[];
      SCRIPT_SRC: string[];
      STYLE_SRC: string[];
      IMG_SRC: string[];
      FONT_SRC: string[];
      OBJECT_SRC: string[];
      BASE_URI: string[];
      FORM_ACTION: string[];
      FRAME_ANCESTORS: string[];
      UPGRADE_INSECURE_REQUESTS: boolean;
      BLOCK_ALL_MIXED_CONTENT: boolean;
    };
    PERMISSIONS_POLICY: {
      ACCELEROMETER: string[];
      AMBIENT_LIGHT_SENSOR: string[];
      AUTOPLAY: string[];
      BATTERY: string[];
      CAMERA: string[];
      CROSS_ORIGIN_ISOLATED: string[];
      DISPLAY_CAPTURE: string[];
      DOCUMENT_DOMAIN: string[];
      ENCRYPTED_MEDIA: string[];
      EXECUTION_WHILE_NOT_RENDERED: string[];
      EXECUTION_WHILE_OUT_OF_VIEWPORT: string[];
      FULLSCREEN: string[];
      GEOLOCATION: string[];
      GYROSCOPE: string[];
      KEYBOARD_MAP: string[];
      MAGNETOMETER: string[];
      MICROPHONE: string[];
      MIDI: string[];
      NAVIGATION_OVERRIDE: string[];
      PAYMENT: string[];
      PICTURE_IN_PICTURE: string[];
      PUBLICKEY_CREDENTIALS_GET: string[];
      SCREEN_WAKE_LOCK: string[];
      SYNC_XHR: string[];
      USB: string[];
      WEB_SHARE: string[];
      XR_SPATIAL_TRACKING: string[];
    };
  };
  WAITLIST: {
    TITLE: string;
    DESCRIPTION: string;
    SHOW_COUNT: boolean;
  };
}
