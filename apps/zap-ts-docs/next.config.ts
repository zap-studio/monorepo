import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  async rewrites() {
    return await Promise.resolve([
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
    ]);
  },
};

export default withMDX(config);
