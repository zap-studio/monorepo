import { useEffect, useState } from "react";

export type deviceType = "Mobile" | "Tablet" | "Desktop";

export type DeviceState = {
  isSupported: boolean;
  deviceType: deviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

/**
 * React hook that returns the type of device the code is running on.
 * @returns {DeviceState} The type of device the code is running on.
 */

export const useDetectDevice = (): DeviceState => {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    isSupported: true,
    deviceType: "Desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const handleDeviceDetection = () => {
      if (typeof navigator === "undefined") {
        setDeviceState((prevState) => ({
          ...prevState,
          isSupported: false,
        }));
        return;
      }

      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile =
        /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      const isTablet =
        /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent);

      if (isMobile) {
        setDeviceState({
          isSupported: true,
          deviceType: "Mobile",
          isMobile: true,
          isTablet: false,
          isDesktop: false,
        });
      } else if (isTablet) {
        setDeviceState({
          isSupported: true,
          deviceType: "Tablet",
          isMobile: false,
          isTablet: true,
          isDesktop: false,
        });
      } else {
        setDeviceState({
          isSupported: true,
          deviceType: "Desktop",
          isMobile: false,
          isTablet: false,
          isDesktop: true,
        });
      }
    };

    handleDeviceDetection();
    window.addEventListener("resize", handleDeviceDetection);
    return () => {
      window.removeEventListener("resize", handleDeviceDetection);
    };
  }, []);

  return deviceState;
};
