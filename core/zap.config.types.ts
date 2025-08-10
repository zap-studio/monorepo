import type { Provider } from "@/zap.config";
import type { Product } from "@/zap/payments/providers/polar/utils";

export interface ZapSettings {
  AI: {
    COMPLETION?: {
      FREQUENCY_PENALTY?: number;
      MAX_OUTPUT_TOKENS?: number;
      MAX_RETRIES?: number;
      PRESENCE_PENALTY?: number;
      STOP_SEQUENCES?: string[];
      TEMPERATURE?: number;
    };
    CHAT?: {
      FREQUENCY_PENALTY?: number;
      MAX_OUTPUT_TOKENS?: number;
      MAX_RETRIES?: number;
      PRESENCE_PENALTY?: number;
      STOP_SEQUENCES?: string[];
      TEMPERATURE?: number;
    };
    SYSTEM_PROMPT: string;
  };
  ANALYTICS: {
    ENABLE_POSTHOG: boolean;
    ENABLE_VERCEL_ANALYTICS: boolean;
    ENABLE_VERCEL_SPEED_INSIGHTS: boolean;
  };
  AUTH: {
    ENABLE_SOCIAL_PROVIDER: boolean;
    LOGIN_URL: string;
    MAXIMUM_PASSWORD_LENGTH: number;
    MAXIMUM_USERNAME_LENGTH: number;
    MINIMUM_PASSWORD_LENGTH: number;
    MINIMUM_USERNAME_LENGTH: number;
    PASSWORD_COMPROMISED_MESSAGE: string;
    PROVIDERS: Provider[];
    PUBLIC_PATHS: string[];
    REDIRECT_URL_AFTER_SIGN_IN: string;
    REDIRECT_URL_AFTER_SIGN_UP: string;
    REQUIRE_MAIL_VERIFICATION: boolean;
    VERIFIED_EMAIL_PATH: string;
  };
  BLOG: {
    BASE_PATH: string;
    DATA_DIR: string;
  };
  LEGAL: {
    DATA_DIR: string;
  };
  MAILS: {
    FROM: string;
    PREFIX: string;
    RATE_LIMIT_SECONDS: number;
  };
  PAYMENTS: {
    POLAR?: {
      AUTHENTICATED_USERS_ONLY: boolean;
      CREATE_CUSTOMER_ON_SIGNUP: boolean;
      ENVIRONMENT: "sandbox" | "production" | undefined;
      PRODUCTS?: Product[];
      SUCCESS_URL?: string;
    };
  };
  PWA: {
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
  SECURITY: {
    CSP: {
      BASE_URI: string[];
      BLOCK_ALL_MIXED_CONTENT: boolean;
      DEFAULT_SRC: string[];
      FONT_SRC: string[];
      FORM_ACTION: string[];
      FRAME_ANCESTORS: string[];
      FRAME_SRC: string[];
      IMG_SRC: string[];
      OBJECT_SRC: string[];
      SCRIPT_SRC: string[];
      STYLE_SRC: string[];
      UPGRADE_INSECURE_REQUESTS: boolean;
    };
    PERMISSIONS_POLICY: {
      ACCELEROMETER: string[];
      AUTOPLAY: string[];
      BLUETOOTH: string[];
      CAMERA: string[];
      CROSS_ORIGIN_ISOLATED: string[];
      DISPLAY_CAPTURE: string[];
      ENCRYPTED_MEDIA: string[];
      FULLSCREEN: string[];
      GAMEPAD: string[];
      GEOLOCATION: string[];
      GYROSCOPE: string[];
      HID: string[];
      IDLE_DETECTION: string[];
      LOCAL_FONTS: string[];
      MAGNETOMETER: string[];
      MICROPHONE: string[];
      MIDI: string[];
      PAYMENT: string[];
      PICTURE_IN_PICTURE: string[];
      PUBLICKEY_CREDENTIALS_GET: string[];
      SCREEN_WAKE_LOCK: string[];
      SERIAL: string[];
      USB: string[];
      WEB_SHARE: string[];
      XR_SPATIAL_TRACKING: string[];
    };
  };
  WAITLIST: {
    DESCRIPTION: string;
    ENABLE_WAITLIST_PAGE: boolean;
    SHOW_COUNT: boolean;
    TITLE: string;
  };
}
