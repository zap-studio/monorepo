import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ["@takumi-rs/core", "@takumi-rs/image-response"],
  async rewrites() {
    return await Promise.resolve([
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ]);
  },
};

export default withMDX(config);
