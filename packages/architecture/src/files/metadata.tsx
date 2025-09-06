import { L } from "../helpers/link.js";
import type { FileList } from "../types.js";

export const MetadataFiles: FileList = {
  category: "METADATA",
  entries: [
    {
      path: "src/app/apple-icon.png",
      status: "added",
      required: false,
      plugins: ["seo"],
      children: (
        <>
          Apple Touch Icon for better{" "}
          <L href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide">
            SEO (Search Engine Optimization)
          </L>
          .
        </>
      ),
    },
    {
      path: "src/app/fonts.ts",
      status: "added",
      required: true,
      children: (
        <>
          Configuration file for <L href="https://vercel.com/font">Geist</L>{" "}
          font to be used in the application.
        </>
      ),
    },
    {
      path: "src/app/icon.png",
      status: "added",
      required: false,
      plugins: ["seo"],
      children: (
        <>
          Standard icon for better{" "}
          <L href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide">
            SEO (Search Engine Optimization)
          </L>
          .
        </>
      ),
    },
    {
      path: "src/app/opengraph-image/route.tsx",
      status: "added",
      required: false,
      plugins: ["seo"],
      children: (
        <>
          Dynamic Open Graph image generation route using{" "}
          <L href="https://og-image.vercel.app/">OG Image</L> to create social
          media preview images on the fly.
        </>
      ),
    },
    {
      path: "src/app/manifest.ts",
      status: "added",
      required: false,
      plugins: ["pwa"],
      children: (
        <>
          Configuration file for the{" "}
          <L href="https://developer.mozilla.org/en-US/docs/Web/Manifest">
            Web App Manifest
          </L>{" "}
          to provide metadata for the application when installed on a device or
          added to the home screen as a{" "}
          <L href="https://web.dev/progressive-web-apps/">
            PWA (Progressive Web App)
          </L>
          .
        </>
      ),
    },
  ],
};
