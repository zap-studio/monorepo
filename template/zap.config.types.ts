import type { PluginId } from "@zap-ts/architecture/types";

export type ZapCoreSettings = {
  // Core application information
  APP: {
    NAME: string;
    APP_NAME: string;
    DESCRIPTION: string;
    BASE_URL: string;
    SALES_EMAIL: string;
    SUPPORT_EMAIL: string;
    APP_URL: string;
  };
  // Security settings that affect the whole app
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
};

export type ZapPluginConfig = {
  [key: string]: unknown;
};

export interface ZapConfig extends ZapCoreSettings {
  plugins?: Record<string, ZapPluginConfig>;
}

export type ZapPlugins = PluginId;
