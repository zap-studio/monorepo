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
  async redirects() {
    return await Promise.resolve([
      {
        source: "/local-ts",
        destination: "/docs/local-ts",
        permanent: true,
      },
      {
        source: "/packages/fetch",
        destination: "/docs/packages/fetch",
        permanent: true,
      },
      {
        source: "/packages/permit",
        destination: "/docs/packages/permit",
        permanent: true,
      },
      {
        source: "/packages/validation",
        destination: "/docs/packages/validation",
        permanent: true,
      },
    ]);
  },
};

export default withMDX(config);
