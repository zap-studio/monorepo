import createBundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { BASE_URL, ZAP_CORE_CONFIG } from "./zap.config";

function buildCSPHeader(): string {
  const { CSP } = ZAP_CORE_CONFIG.SECURITY;

  const directives = [
    `default-src ${CSP.DEFAULT_SRC.join(" ")}`,
    `script-src ${CSP.SCRIPT_SRC.join(" ")}`,
    `style-src ${CSP.STYLE_SRC.join(" ")}`,
    `img-src ${CSP.IMG_SRC.join(" ")}`,
    `font-src ${CSP.FONT_SRC.join(" ")}`,
    `object-src ${CSP.OBJECT_SRC.join(" ")}`,
    `base-uri ${CSP.BASE_URI.join(" ")}`,
    `form-action ${CSP.FORM_ACTION.join(" ")}`,
    `frame-ancestors ${CSP.FRAME_ANCESTORS.join(" ")}`,
    `frame-src ${CSP.FRAME_SRC.join(" ")}`,
  ];

  if (CSP.BLOCK_ALL_MIXED_CONTENT) {
    directives.push("block-all-mixed-content");
  }

  if (CSP.UPGRADE_INSECURE_REQUESTS) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function buildPermissionsPolicy(): string {
  return Object.entries(ZAP_CORE_CONFIG.SECURITY.PERMISSIONS_POLICY)
    .map(([feature, values]) => {
      const policyFeature = feature.toLowerCase().replace(/_/g, "-");
      if (values.length === 0) {
        return `${policyFeature}=()`;
      }

      const formattedValues = values
        .map((val) => {
          if (val === "self" || val === "*") {
            return val;
          }

          return `"${val}"`;
        })
        .join(" ");

      return `${policyFeature}=(${formattedValues})`;
    })
    .join(", ");
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  async headers() {
    return await Promise.resolve([
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: `'self' ${BASE_URL}`.trim(),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: buildCSPHeader(),
          },
          {
            key: "Permissions-Policy",
            value: buildPermissionsPolicy(),
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ]);
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(withMDX(nextConfig));
