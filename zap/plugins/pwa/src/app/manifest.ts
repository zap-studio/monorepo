import type { MetadataRoute } from "next";

// TODO: update the manifest with your own information
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zap.ts",
    short_name: "Zap.ts",
    description: "The boilerplate to build application as fast as a zap.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
